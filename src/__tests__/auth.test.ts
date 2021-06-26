import app from '../http/app'
import request from 'supertest'

const jwtRegex = new RegExp(
  '^[A-Za-z0-9-_=]+.[A-Za-z0-9-_=]+.?[A-Za-z0-9-_.+/=]*$'
)

describe('Auth Endpoint', () => {
  test('Should deny token access (no user/pass)', async () => {
    const res = await request(app).post('/v1/auth/login')
    expect(res.statusCode).toBe(400)
  })
  test('Should get token', async () => {
    const res = await request(app)
      .post('/v1/auth/login')
      .type('form')
      .send('user=user&pass=pass')

    expect(res.statusCode).toBe(200)
    expect(jwtRegex.test(res.body.token)).toBe(true)
  })
})
