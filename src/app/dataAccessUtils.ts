import { Trip } from 'domain/trip'
import { ObjectID } from 'mongodb'

/**
 * Converts database object to domain model.
 * @param document - The schema for documents in trips collection
 * @returns The Trip Domain Model.
 */
export const convertDataSchemaToModel = (document: TripMongoSchema): Trip => {
  const trip = new Trip(
    document._id ? document._id.toString() : '',
    {
      longitude: document.start.coordinates[0],
      latitude: document.start.coordinates[1]
    },
    document.start_date,
    {
      year: document.year,
      color: document.color,
      make: document.make,
      model: document.model,
      surgeFactor: document.surge_factor
    }
  )
  trip.charityId = document.charity_id
  trip.date = document.Date
  trip.distanceTravelled = document.distance_travelled
  trip.driverRating = document.driver_rating
  trip.end = {
    longitude: document.end.coordinates[0],
    latitude: document.end.coordinates[1]
  }
  trip.endDateTime = document.complete_date
  trip.endZipCode = document.end_zip_code
  trip.freeCreditUsed = document.free_credit_used
  trip.prcp = document.PRCP
  trip.rating = document.rating
  trip.requestedCarCategory = document.requested_car_category
  trip.riderRating = document.rider_rating
  trip.tMax = document.TMAX
  trip.tMin = document.TMIN
  trip.weather = {
    awnd: document.AWND,
    gustSpeed2: document.GustSpeed2,
    fog: document.Fog,
    heavyFog: document.HeavyFog,
    thunder: document.Thunder
  }
  return trip
}

type geolocation = {
  type: 'Point'
  coordinates: Array<number>
}

export type TripMongoSchema = {
  _id?: ObjectID
  distance_travelled: number
  driver_rating: number
  rider_rating: number
  start_zip_code: null
  end_zip_code: string
  charity_id: number
  requested_car_category: string
  free_credit_used: number
  surge_factor: number
  color: string
  make: string
  model: string
  year: number
  rating: number
  Date: string
  PRCP: number
  TMAX: number
  TMIN: number
  AWND: number
  GustSpeed2: number
  Fog: number
  HeavyFog: number
  Thunder: number
  start: geolocation
  end: geolocation
  complete_date: Date
  start_date: Date
}
