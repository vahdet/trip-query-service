import { Router, Request, Response } from 'express'
import { validationResult, query } from 'express-validator'
import passport from 'passport'
import winston from 'winston'
import { MongoRepository } from '../../app/repository'
import { TripService } from '../../app/service'

const mongoUri = process.env.MONGO_URI ?? 'mongodb://localhost:27017'
const database = process.env.MONGO_DB_NAME ?? 'case'

const logger = winston.loggers.get('default')

// initialize TripService
const service = new TripService(new MongoRepository(mongoUri, database))

const router = Router()
router.use(passport.authenticate('jwt', { session: false }))

router.get(
  '/',
  query('lat').isDecimal(),
  query('long').isDecimal(),
  query('rad').isDecimal(),
  query('start').optional().isISO8601(),
  query('end').optional().isISO8601(),
  async (req: Request, res: Response) => {
    try {
      // Parse query parameters & validate
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const latitude = parseFloat(req.query.lat as string)
      const longitude = parseFloat(req.query.long as string)
      const radiusInKm = parseFloat(req.query.rad as string)
      const startDateTime = req.query.start
        ? Date.parse(req.query.start as string)
        : undefined
      const endDateTime = req.query.start
        ? Date.parse(req.query.end as string)
        : undefined

      // Call service
      logger.info(
        `getting trips for lat: ${latitude}, long: ${longitude} and radius of ${radiusInKm} kilometers`
      )
      const trips = await service.getTrips(
        {
          point: { latitude, longitude },
          radius: radiusInKm * 1000
        },
        startDateTime ? new Date(startDateTime) : undefined,
        endDateTime ? new Date(endDateTime) : undefined
      )
      res.json(trips)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }
)

router.get(
  '/distances',
  query('lat').isDecimal(),
  query('long').isDecimal(),
  query('rad').isDecimal(),
  async (req: Request, res: Response) => {
    try {
      // Parse query parameters & validate
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const latitude = parseFloat(req.query.lat as string)
      const longitude = parseFloat(req.query.long as string)
      const radiusInKm = parseFloat(req.query.rad as string)

      // Call service
      logger.info(
        `getting distances for lat: ${latitude}, long: ${longitude} and radius of ${radiusInKm} kilometers`
      )
      const distances = await service.getMinMaxTravelledDistances({
        point: { latitude, longitude },
        radius: radiusInKm * 1000
      })
      res.json(distances)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }
)

router.get(
  '/reports/vehiclemodelstats',
  query('lat').isDecimal(),
  query('long').isDecimal(),
  query('rad').isDecimal(),
  async (req: Request, res: Response) => {
    try {
      // Parse query parameters & validate
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const latitude = parseFloat(req.query.lat as string)
      const longitude = parseFloat(req.query.long as string)
      const radiusInKm = parseFloat(req.query.rad as string)

      // Call service
      logger.info(
        `getting trip counts per model for lat: ${latitude}, long: ${longitude} and radius of ${radiusInKm} kilometers`
      )
      const counts = await service.getVehicleModelGroupedTripCounts({
        point: { latitude, longitude },
        radius: radiusInKm * 1000
      })
      res.json(counts)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }
)

export default router
