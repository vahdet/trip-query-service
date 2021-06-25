export class Trip {
  id: string
  start: GeolocationPoint
  end?: GeolocationPoint
  distanceTravelled?: number
  startDateTime: Date
  endDateTime?: Date
  vehicle: Vehicle
  driverRating?: number
  riderRating?: number
  startZipCode?: string
  endZipCode?: string
  charityId?: number
  requestedCarCategory?: string
  freeCreditUsed?: number
  rating?: number
  date?: string
  prcp?: number
  tMax?: number
  tMin?: number
  weather?: WeatherConditions

  constructor(
    id: string,
    start: GeolocationPoint,
    startDateTime: Date,
    vehicle: Vehicle,
    startZipCode?: string
  ) {
    this.id = id
    this.start = start
    this.startDateTime = startDateTime
    this.vehicle = vehicle
    this.startZipCode = startZipCode
  }
}

export interface GeolocationPoint {
  longitude: number
  latitude: number
}

export interface Vehicle {
  year: number
  color: string
  make: string
  model: string
  surgeFactor?: number
}

export interface WeatherConditions {
  awnd?: number
  gustSpeed2?: number
  fog?: number
  heavyFog?: number
  thunder?: number
}
