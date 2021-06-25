import * as bodyParser from 'body-parser'
import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'

const router = Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.post(
  '/login',
  body('user').isAlphanumeric(),
  body('pass').isAlphanumeric(),
  async (req: Request, res: Response) => {
    try {
      // Parse body
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }
      const { user, pass } = req.body()

      // Validate user & pass
      if (process.env.TEST_USER !== user || process.env.TEST_PASS !== pass) {
        return res.status(401).send()
      }

      // Generate JWT token (No expiration, no additional config)
      const token = jwt.sign({ username: user }, process.env.JWT_SECRET ?? '')

      // Call service
      res.json(trips)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }
)

export default router
