import 'dotenv/config'
import app from './http/app'

const port = process.env.PORT ?? 3000

app.listen(port, () => {
  console.log(`Listening to requests at http://localhost:${port}`)
})
