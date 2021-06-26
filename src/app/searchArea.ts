import { GeolocationPoint } from '../domain/trip'

export interface GeolocationCircle {
  point: GeolocationPoint
  radius: number
}
