import { Router, Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'

const router = Router()

router.post(
  '/login',
  body('user').isAlphanumeric(),
  body('pass').isAlphanumeric(),
  async (req: Request, res: Response) => {
    try {
      // Parse body
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
      }
      const { user, pass } = req.body

      // Validate user & pass
      if (process.env.TOKEN_USER !== user || process.env.TOKEN_PASS !== pass) {
        res.status(401).send('Invalid username or password')
        return
      }

      const token = jwt.sign({ username: user }, process.env.JWT_SECRET ?? '')
      res.json({ token })
    } catch (err) {
      res.status(500).send(err.message)
    }
  }
)

export default router
