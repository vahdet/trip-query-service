import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'

passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    (jwtPayload, done) => {
      if (jwtPayload.username) {
        return done(null, false)
      }
      return done(null, jwtPayload.username)
    }
  )
)
