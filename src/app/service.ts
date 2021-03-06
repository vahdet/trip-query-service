import { GeolocationCircle } from './searchArea'
import { Trip } from '../domain/trip'
import { IRepository } from './repository'

/**
 * A service interface for trips
 */
export interface IService<T> {
  getTrips(
    searchCircle: GeolocationCircle,
    startDateTime?: Date,
    endDateTime?: Date
  ): Promise<Array<T>>
  getMinMaxTravelledDistances(
    searchCircle: GeolocationCircle
  ): Promise<{ min: number; max: number }>
  getVehicleModelGroupedTripCounts(
    searchCircle: GeolocationCircle
  ): Promise<Record<number, number>>
}

/**
 * A service implementation for the trips
 */
export class TripService {
  #repo: IRepository<Trip>

  constructor(repo: IRepository<Trip>) {
    this.#repo = repo
  }

  /**
   * Returns a list of trip promises.
   * @param searchCircle - The geolocation circle (i.e. starting point + radius)
   * @param startDateTime - Minimum trip start time
   * @param endDateTime - Maximum trip end time
   * @returns The array of trips as a promise
   */
  public async getTrips(
    searchCircle: GeolocationCircle,
    startDateTime?: Date,
    endDateTime?: Date
  ): Promise<Array<Trip>> {
    return await this.#repo.findTrips(searchCircle, startDateTime, endDateTime)
  }

  /**
   * Returns minimum and maximum travelled distances started from a user-defined region.
   * @param searchCircle - The geolocation circle (i.e. starting point + radius)
   * @returns The object containing distances as a promise
   */
  public async getMinMaxTravelledDistances(
    searchCircle: GeolocationCircle
  ): Promise<{
    min: number
    max: number
  }> {
    return await this.#repo.findMinMaxTravelledDistances(searchCircle)
  }

  /**
   * Returns trip counts per vehicle model year.
   * @param searchCircle - The geolocation circle (i.e. starting point + radius)
   * @returns The model year - trip count pairs as a promise
   */
  public async getVehicleModelGroupedTripCounts(
    searchCircle: GeolocationCircle
  ): Promise<Record<number, number>> {
    return await this.#repo.findVehicleModelGroupedTripCounts(searchCircle)
  }
}
