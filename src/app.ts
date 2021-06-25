import express from 'express'
import morgan from 'morgan'
import winston from 'winston'
import cors from 'cors'
import AuthRouter from './http/routes/auth'
import DefaultRouter from './http/routes/index'

const port = process.env.PORT ?? 3000

winston.loggers.add(process.env.LOGGER_NAME ?? 'default', {
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.json()
  )
})

const app = express()
app.use(morgan('common'))
app.use(cors())
app.use(express.json())

app.use('/v1/auth', AuthRouter)
app.use('/v1/trips', DefaultRouter)

app.listen(port, () => {
  console.log(`Listening to requests at http://localhost:${port}`)
})
