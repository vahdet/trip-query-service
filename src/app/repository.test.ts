import { Collection, Db, MongoClient } from 'mongodb'
import { findTrips, MongoRepository } from './repository'

describe('test against a mock database', () => {
  let connection: MongoClient
  let db: Db
  let trips: Collection

  beforeAll(async () => {
    const repo := new MongoRepository(
      (global as any).__MONGO_URI__,
      (global as any).__MONGO_DB_NAME__
    )
    const trips = db.collection('trips')
    await trips.insertOne(mockTrip1)
  })

  afterAll(async () => {
    await connection.close()
    // await db.close()
  })

  it('should insert a doc into trips collection and then find it', async () => {
    const trips = db.collection('trips')

    const mockTrip1 = { _id: 'some-user-id', name: 'John' }

    const insertedUser = await trips.findOne({ _id: 'some-user-id' })
    expect(insertedUser).toEqual(mockUser)
  })
})
