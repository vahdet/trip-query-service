import { GeolocationCircle } from 'domain/searchArea'
import { Trip } from 'domain/trip'
import { Collection, Db, MongoClient } from 'mongodb'
import assert from 'assert/strict'
import { convertDataSchemaToModel, TripMongoSchema } from './dataAccessUtils'

const tripCollectionName = 'trips'

/**
 * A repository implementation for the trips
 */
export class MongoRepository {
  #db: Db
  #trips: Collection

  constructor(uri: string, dbName: string) {
    const client = new MongoClient(uri, {
      useNewUrlParser: true
    })
    client.connect((err) => {
      assert.equal(null, err) // if not, program is terminated
      client.close()
      throw new Error(`unable to connect to the database at uri: ${uri}`)
    })
    this.#db = client.db(dbName)
    this.#trips = this.#db.collection(tripCollectionName)
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
        end_date: { $lte: endDateTime }
      })
    }

    const queryResultsCursor = this.#trips.find({ $and: query })
    // Collect results async
    const result = []
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
      .find(query)
      .sort({ distance_travelled: 1 })
      .limit(1)
    const maxDistance = this.#trips
      .find(query)
      .sort({ distance_travelled: -1 })
      .limit(1)
    return {
      min: ((await minDistance.toArray())[0] as TripMongoSchema)
        .distance_travelled,
      max: ((await maxDistance.toArray())[0] as TripMongoSchema)
        .distance_travelled
    }
  }

  /**
   * Returns trip counts per vehicle model year.
   * @param searchCircle - The geolocation circle (i.e. starting point + radius)
   * @returns The model year - trip count pairs as a promise
   */
  public async findVehicleModelGroupedTripCounts(
    searchCircle: GeolocationCircle
  ): Promise<any> {
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

    const aggregateResultsCursor = this.#trips.aggregate([
      { $match: query },
      { $group: { _id: '$year', count: { $sum: 1 } } }
    ])
    // Collect results async
    const result = {}
    for await (const doc of aggregateResultsCursor) {
      result[doc._id as number] = doc.count
    }
    return result
  }
}
