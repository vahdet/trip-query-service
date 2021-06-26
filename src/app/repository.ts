import { default as mongodb } from 'mongodb'
import winston from 'winston'
import { strict as assert } from 'assert'
import { Trip } from '../domain/trip'
import { GeolocationCircle } from './searchArea'
import { convertDataSchemaToModel, TripMongoSchema } from './conversion'

const tripCollectionName = 'trips'

const logger = winston.loggers.get('default')

/**
 * A repository interface for trips
 */
export interface IRepository<T> {
  findTrips(
    searchCircle: GeolocationCircle,
    startDateTime?: Date,
    endDateTime?: Date
  ): Promise<Array<T>>
  findMinMaxTravelledDistances(
    searchCircle: GeolocationCircle
  ): Promise<{ min: number; max: number }>
  findVehicleModelGroupedTripCounts(
    searchCircle: GeolocationCircle
  ): Promise<Record<number, number>>
}

/**
 * A repository implementation for the trips
 */
export class MongoRepository implements IRepository<Trip> {
  #trips: mongodb.Collection | undefined

  constructor(uri: string, dbName: string) {
    ;(async () => {
      const cli = await mongodb.MongoClient.connect(uri, {
        useUnifiedTopology: true,
        useNewUrlParser: true
      })
      const db = await cli.db(dbName)
      this.#trips = db.collection(tripCollectionName)
    })()
  }

  /**
   * Returns a list of trip promises.
   * @param searchCircle - The geolocation circle (i.e. starting point + radius)
   * @param startDateTime - Minimum trip start time
   * @param endDateTime - Maximum trip end time
   * @returns The array of trips as a promise
   */
  public async findTrips(
    searchCircle: GeolocationCircle,
    startDateTime?: Date,
    endDateTime?: Date
  ): Promise<Array<Trip>> {
    if (!this.#trips) {
      throw new Error('collection is not initilalized')
    }

    const query = [
      {
        start: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [
                searchCircle.point.longitude,
                searchCircle.point.latitude
              ]
            },
            $maxDistance: searchCircle.radius
          }
        }
      }
    ] as Array<any>
    if (startDateTime) {
      query.push({
        start_date: { $gte: startDateTime }
      })
    }
    if (endDateTime) {
      query.push({
        complete_date: { $lte: endDateTime }
      })
    }
    const queryResultsCursor = this.#trips?.find({ $and: query })
    // Collect results async
    const result = []
    if (!queryResultsCursor) return []
    for await (const doc of queryResultsCursor) {
      result.push(convertDataSchemaToModel(doc))
    }
    return result
  }

  /**
   * Returns minimum and maximum travelled distances started from a user-defined region.
   * @param searchCircle - The geolocation circle (i.e. starting point + radius)
   * @returns The object containing distances as a promise
   */
  public async findMinMaxTravelledDistances(
    searchCircle: GeolocationCircle
  ): Promise<{
    min: number
    max: number
  }> {
    if (!this.#trips) {
      throw new Error('collection is not initilalized')
    }
    const query = {
      start: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [
              searchCircle.point.longitude,
              searchCircle.point.latitude
            ]
          },
          $maxDistance: searchCircle.radius
        }
      }
    }
    const minDistance = this.#trips
      ?.find(query)
      .sort({ distance_travelled: 1 })
      .limit(1)
    const maxDistance = this.#trips
      ?.find(query)
      .sort({ distance_travelled: -1 })
      .limit(1)
    const minDistanceArray = (await minDistance?.toArray()) ?? []
    const maxDistanceArray = (await maxDistance?.toArray()) ?? []
    return {
      min: (minDistanceArray[0] as TripMongoSchema).distance_travelled,
      max: (maxDistanceArray[0] as TripMongoSchema).distance_travelled
    }
  }

  /**
   * Returns trip counts per vehicle model year.
   * @param searchCircle - The geolocation circle (i.e. starting point + radius)
   * @returns The model year - trip count pairs as a promise
   */
  public async findVehicleModelGroupedTripCounts(
    searchCircle: GeolocationCircle
  ): Promise<Record<number, number>> {
    if (!this.#trips) {
      throw new Error('collection is not initilalized')
    }
    const aggregateResultsCursor = this.#trips?.aggregate([
      {
        $geoNear: {
          key: 'start',
          distanceField: 'dist.calc',
          near: {
            type: 'Point',
            coordinates: [
              searchCircle.point.longitude,
              searchCircle.point.latitude
            ]
          },
          maxDistance: searchCircle.radius
        }
      },
      { $group: { _id: '$year', count: { $sum: 1 } } }
    ])
    // Collect results async
    const result: Record<number, number> = {}
    if (!aggregateResultsCursor) return {}
    for await (const doc of aggregateResultsCursor) {
      result[doc._id as number] = doc.count
    }
    return result
  }
}
