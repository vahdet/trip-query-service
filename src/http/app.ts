import 'dotenv/config'
import express from 'express'
import morgan from 'morgan'
import winston from 'winston'
import cors from 'cors'
import passport from 'passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import AuthRouter from './routes/auth'
import TripsRouter from './routes/trips'

winston.loggers.add(process.env.LOGGER_NAME ?? 'default', {
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
})

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    (jwtPayload, done) => {
      if (!jwtPayload.username) {
        return done(null, false)
      }
      return done(null, jwtPayload.username)
    }
  )
)

const app = express()
app.use(morgan('common'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/v1/auth', AuthRouter)
app.use('/v1/trips', TripsRouter)

export default app
