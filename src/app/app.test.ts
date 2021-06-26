import { default as mongodb } from 'mongodb'
import { IService, TripService } from './service'
import { IRepository, MongoRepository } from './repository'
import { convertDataSchemaToModel, TripMongoSchema } from './conversion'
import { Trip } from 'src/domain/trip'

const tripCollectionName = 'trips'

describe('test against a mock database', () => {
  let cli: mongodb.MongoClient
  let db: mongodb.Db
  let repo: IRepository<Trip>
  let service: IService<Trip>

  beforeAll(async () => {
    const mongoUri = (global as any).__MONGO_URI__
    const mongoDatabase = (global as any).__MONGO_DB_NAME__
    // Prepare mock DB
    cli = await mongodb.MongoClient.connect(mongoUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true
    })
    db = await cli.db(mongoDatabase)
    await db.createCollection(tripCollectionName)
    const trips = db.collection(tripCollectionName)
    trips.createIndex({ start: '2dsphere' })
    trips.createIndex({ end: '2dsphere' })

    await trips.insertMany(dataOfFifty)

    // prepare repo and service instances
    repo = new MongoRepository(mongoUri, mongoDatabase)
    service = new TripService(repo)
    // await new Promise((r) => setImmediate(r))
    await new Promise((r) => setTimeout(r, 500))
  })

  afterAll(async () => {
    await db.collection(tripCollectionName).deleteMany({})
    await cli.close()
  })

  test('repository: should find trips without start & end dates', async () => {
    const result = await repo.findTrips({
      point: { longitude: -97, latitude: 31 },
      radius: 150000
    })
    expect(result.length).toBeGreaterThan(0)
  })
  test('service: should get trips without start & end dates', async () => {
    const result = await service.getTrips({
      point: { longitude: -97.70929823, latitude: 31.04685111 },
      radius: 15000
    })
    expect(result.length).toBeGreaterThan(0)
  })

  test('repository: should find trip distances', async () => {
    const result = await repo.findMinMaxTravelledDistances({
      point: { longitude: -97, latitude: 31 },
      radius: 150000
    })
    expect(result.min).toBeGreaterThan(0)
    expect(result.max).toBeGreaterThan(0)
  })
  test('service: should get trip distances', async () => {
    const result = await service.getMinMaxTravelledDistances({
      point: { longitude: -97.70929823, latitude: 31.04685111 },
      radius: 15000
    })
    expect(result.min).toBeGreaterThan(0)
    expect(result.max).toBeGreaterThan(0)
  })

  test('repository: should find vehicle model grouped reports', async () => {
    const result = await repo.findVehicleModelGroupedTripCounts({
      point: { longitude: -97, latitude: 31 },
      radius: 150000
    })
    expect(Object.keys(result).length).toBeGreaterThan(0)
  })
  test('service: should get vehicle model grouped reports', async () => {
    const result = await service.getVehicleModelGroupedTripCounts({
      point: { longitude: -97.70929823, latitude: 31.04685111 },
      radius: 15000
    })
    expect(Object.keys(result).length).toBeGreaterThan(0)
  })
})

describe('conversions', () => {
  test('Should convert data schema to domain model', () => {
    const sampleMongoObjectId = '507f1f77bcf86cd799439011'
    const input: TripMongoSchema = dataOfFifty[0]
    input._id = new mongodb.ObjectID(sampleMongoObjectId)
    const res = convertDataSchemaToModel(input)
    expect(res.id).toEqual(sampleMongoObjectId)
    expect(res.prcp).toEqual(input.PRCP)
    expect(res.weather?.fog).toEqual(input.Fog)
  })
})

/* Result of db.getCollection('trips').find({}).limit(50).toArray() */
const dataOfFifty = [
  {
    distance_travelled: 790,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 5,
    Date: '2016-06-04',
    PRCP: 0.1,
    TMAX: 86,
    TMIN: 67,
    AWND: 4.9,
    GustSpeed2: 13,
    Fog: 1,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.70929823, 31.04685111]
    },
    end: {
      type: 'Point',
      coordinates: [-97.14107472, 30.39216848]
    },
    complete_date: new Date('2016-06-04T15:26:07.000Z'),
    start_date: new Date('2016-06-04T15:24:25.000Z')
  },
  {
    distance_travelled: 3318,
    driver_rating: 4.5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Brown',
    make: 'BMW',
    model: 'X5',
    year: 2013,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.07070025, 30.44261897]
    },
    end: {
      type: 'Point',
      coordinates: [-97.11128034, 30.58028507]
    },
    complete_date: new Date('2016-06-06T16:49:32.000Z'),
    start_date: new Date('2016-06-06T16:41:39.000Z')
  },
  {
    distance_travelled: 3144,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Volkswagen',
    model: 'Golf',
    year: 2011,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.20957146, 30.85860711]
    },
    end: {
      type: 'Point',
      coordinates: [-97.56209693, 30.94537646]
    },
    complete_date: new Date('2016-06-07T21:09:49.000Z'),
    start_date: new Date('2016-06-07T21:00:24.000Z')
  },
  {
    distance_travelled: 568,
    driver_rating: 3,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Gray',
    make: 'Bentley',
    model: 'Continental GT',
    year: 2013,
    rating: 5,
    Date: '2016-06-04',
    PRCP: 0.1,
    TMAX: 86,
    TMIN: 67,
    AWND: 4.9,
    GustSpeed2: 13,
    Fog: 1,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-120.28923776, 38.86485915]
    },
    end: {
      type: 'Point',
      coordinates: [-120.67857905, 39.01746041]
    },
    complete_date: new Date('2016-06-04T08:17:57.000Z'),
    start_date: new Date('2016-06-04T08:16:02.000Z')
  },
  {
    distance_travelled: 9859,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 5,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.48546432, 30.78643865]
    },
    end: {
      type: 'Point',
      coordinates: [-96.94008792, 31.01412168]
    },
    complete_date: new Date('2016-06-05T21:12:33.000Z'),
    start_date: new Date('2016-06-05T20:56:15.000Z')
  },
  {
    distance_travelled: 2411,
    driver_rating: 3,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'SRX',
    year: 2012,
    rating: 4.88888888889,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-96.80350691, 31.12042549]
    },
    end: {
      type: 'Point',
      coordinates: [-97.17662567, 30.53274499]
    },
    complete_date: new Date('2016-06-05T22:23:50.000Z'),
    start_date: new Date('2016-06-05T22:15:15.000Z')
  },
  {
    distance_travelled: 10260,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Infiniti',
    model: 'QX60',
    year: 2015,
    rating: 5,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.71361162, 30.38810186]
    },
    end: {
      type: 'Point',
      coordinates: [-97.5866832, 30.98894508]
    },
    complete_date: new Date('2016-06-05T04:33:20.000Z'),
    start_date: new Date('2016-06-05T04:17:40.000Z')
  },
  {
    distance_travelled: 2171,
    driver_rating: 0.5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 4.90909090909,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.71008595, 30.66010668]
    },
    end: {
      type: 'Point',
      coordinates: [-97.67894103, 30.74415772]
    },
    complete_date: new Date('2016-06-05T03:50:57.000Z'),
    start_date: new Date('2016-06-05T03:40:36.000Z')
  },
  {
    distance_travelled: 2290,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'SRX',
    year: 2012,
    rating: 4.88888888889,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-96.83969115, 30.30319904]
    },
    end: {
      type: 'Point',
      coordinates: [-97.53415836, 30.27885979]
    },
    complete_date: new Date('2016-06-05T21:55:55.000Z'),
    start_date: new Date('2016-06-05T21:47:33.000Z')
  },
  {
    distance_travelled: 1815,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Brown',
    make: 'Ford',
    model: 'Explorer',
    year: 2013,
    rating: 4.88888888889,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.15198748, 30.67903907]
    },
    end: {
      type: 'Point',
      coordinates: [-97.39889668, 30.61965275]
    },
    complete_date: new Date('2016-06-06T20:54:56.000Z'),
    start_date: new Date('2016-06-06T20:48:55.000Z')
  },
  {
    distance_travelled: 11600,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Brown',
    make: 'Ford',
    model: 'Explorer',
    year: 2013,
    rating: 4.88888888889,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.12941305, 30.85648565]
    },
    end: {
      type: 'Point',
      coordinates: [-97.27000291, 30.67345]
    },
    complete_date: new Date('2016-06-07T00:23:15.000Z'),
    start_date: new Date('2016-06-07T00:01:49.000Z')
  },
  {
    distance_travelled: 4728,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.58672604, 30.52012571]
    },
    end: {
      type: 'Point',
      coordinates: [-97.45396764, 31.06178309]
    },
    complete_date: new Date('2016-06-07T00:12:31.000Z'),
    start_date: new Date('2016-06-07T00:02:14.000Z')
  },
  {
    distance_travelled: 8459,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Gray',
    make: 'Bentley',
    model: 'Continental GT',
    year: 2013,
    rating: 5,
    Date: '2016-06-04',
    PRCP: 0.1,
    TMAX: 86,
    TMIN: 67,
    AWND: 4.9,
    GustSpeed2: 13,
    Fog: 1,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-120.584894, 38.73047246]
    },
    end: {
      type: 'Point',
      coordinates: [-120.76871207, 38.99753737]
    },
    complete_date: new Date('2016-06-04T05:27:32.000Z'),
    start_date: new Date('2016-06-04T05:18:49.000Z')
  },
  {
    distance_travelled: 11950,
    driver_rating: 4.5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Red',
    make: 'Cadillac',
    model: 'CTS',
    year: 2010,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.55231368, 31.06627957]
    },
    end: {
      type: 'Point',
      coordinates: [-97.27762019, 31.07458926]
    },
    complete_date: new Date('2016-06-06T20:36:20.000Z'),
    start_date: new Date('2016-06-06T20:11:52.000Z')
  },
  {
    distance_travelled: 7547,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'White',
    make: 'Nissan',
    model: 'Murano',
    year: 2015,
    rating: 5,
    Date: '2016-06-08',
    PRCP: 0,
    TMAX: 92,
    TMIN: 70,
    AWND: 2.7,
    GustSpeed2: 12.1,
    Fog: 1,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.47458977, 30.35675148]
    },
    end: {
      type: 'Point',
      coordinates: [-97.03285919, 30.91193904]
    },
    complete_date: new Date('2016-06-08T00:22:50.000Z'),
    start_date: new Date('2016-06-08T00:13:03.000Z')
  },
  {
    distance_travelled: 857,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'White',
    make: 'Chevrolet',
    model: 'Tahoe',
    year: 2013,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-96.86041439, 30.31929205]
    },
    end: {
      type: 'Point',
      coordinates: [-97.4924955, 31.24309856]
    },
    complete_date: new Date('2016-06-06T13:42:37.000Z'),
    start_date: new Date('2016-06-06T13:40:14.000Z')
  },
  {
    distance_travelled: 9771,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'White',
    make: 'Nissan',
    model: 'Murano',
    year: 2015,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-96.88947375, 31.30520368]
    },
    end: {
      type: 'Point',
      coordinates: [-97.25289309, 31.15104113]
    },
    complete_date: new Date('2016-06-06T00:07:55.000Z'),
    start_date: new Date('2016-06-05T23:47:31.000Z')
  },
  {
    distance_travelled: 2092,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Brown',
    make: 'BMW',
    model: 'X5',
    year: 2013,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-96.82775006, 31.07276651]
    },
    end: {
      type: 'Point',
      coordinates: [-97.48585752, 30.57209673]
    },
    complete_date: new Date('2016-06-06T18:30:43.000Z'),
    start_date: new Date('2016-06-06T18:23:13.000Z')
  },
  {
    distance_travelled: 2339,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Silver',
    make: 'Toyota',
    model: 'Highlander Hybrid',
    year: 2008,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.66441865, 31.10374112]
    },
    end: {
      type: 'Point',
      coordinates: [-96.82749733, 30.95806049]
    },
    complete_date: new Date('2016-06-07T00:39:56.000Z'),
    start_date: new Date('2016-06-07T00:32:30.000Z')
  },
  {
    distance_travelled: 53655,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'White',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2013,
    rating: 4.86666666667,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.20104997, 31.10321088]
    },
    end: {
      type: 'Point',
      coordinates: [-97.17818345, 31.07167114]
    },
    complete_date: new Date('2016-06-07T15:28:58.000Z'),
    start_date: new Date('2016-06-07T14:35:57.000Z')
  },
  {
    distance_travelled: 1757,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Volkswagen',
    model: 'Golf',
    year: 2011,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.02155224, 31.13612899]
    },
    end: {
      type: 'Point',
      coordinates: [-96.84379924, 31.05540626]
    },
    complete_date: new Date('2016-06-07T20:38:06.000Z'),
    start_date: new Date('2016-06-07T20:31:14.000Z')
  },
  {
    distance_travelled: 1559,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Ford',
    model: 'Explorer',
    year: 2015,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.02042892, 30.70062975]
    },
    end: {
      type: 'Point',
      coordinates: [-96.9865587, 31.08867959]
    },
    complete_date: new Date('2016-06-07T21:21:28.000Z'),
    start_date: new Date('2016-06-07T21:16:42.000Z')
  },
  {
    distance_travelled: 12721,
    driver_rating: 3,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Gray',
    make: 'Toyota',
    model: 'Highlander',
    year: 2012,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.48507178, 30.48200436]
    },
    end: {
      type: 'Point',
      coordinates: [-97.16009554, 31.11314585]
    },
    complete_date: new Date('2016-06-07T20:48:10.000Z'),
    start_date: new Date('2016-06-07T20:17:54.000Z')
  },
  {
    distance_travelled: 4496,
    driver_rating: 4.5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Gray',
    make: 'Toyota',
    model: 'Highlander',
    year: 2012,
    rating: 5,
    Date: '2016-06-08',
    PRCP: 0,
    TMAX: 92,
    TMIN: 70,
    AWND: 2.7,
    GustSpeed2: 12.1,
    Fog: 1,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.61424535, 30.96349355]
    },
    end: {
      type: 'Point',
      coordinates: [-97.55671374, 30.50702508]
    },
    complete_date: new Date('2016-06-08T00:32:15.000Z'),
    start_date: new Date('2016-06-08T00:21:59.000Z')
  },
  {
    distance_travelled: 9768,
    driver_rating: 4.5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Silver',
    make: 'Toyota',
    model: 'Highlander Hybrid',
    year: 2008,
    rating: 5,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.45768603, 30.51782584]
    },
    end: {
      type: 'Point',
      coordinates: [-97.47329412, 30.79719819]
    },
    complete_date: new Date('2016-06-05T07:36:36.000Z'),
    start_date: new Date('2016-06-05T07:26:06.000Z')
  },
  {
    distance_travelled: 1029,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 5,
    Date: '2016-06-04',
    PRCP: 0.1,
    TMAX: 86,
    TMIN: 67,
    AWND: 4.9,
    GustSpeed2: 13,
    Fog: 1,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.64168869, 30.53943377]
    },
    end: {
      type: 'Point',
      coordinates: [-97.09211274, 31.11910025]
    },
    complete_date: new Date('2016-06-04T04:51:15.000Z'),
    start_date: new Date('2016-06-04T04:45:01.000Z')
  },
  {
    distance_travelled: 5294,
    driver_rating: 3,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'SRX',
    year: 2012,
    rating: 4.88888888889,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.57939688, 31.25435353]
    },
    end: {
      type: 'Point',
      coordinates: [-97.3469969, 30.70503105]
    },
    complete_date: new Date('2016-06-05T07:12:48.000Z'),
    start_date: new Date('2016-06-05T06:57:45.000Z')
  },
  {
    distance_travelled: 443,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Gray',
    make: 'Bentley',
    model: 'Continental GT',
    year: 2013,
    rating: 5,
    Date: '2016-06-04',
    PRCP: 0.1,
    TMAX: 86,
    TMIN: 67,
    AWND: 4.9,
    GustSpeed2: 13,
    Fog: 1,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-120.24186458, 38.71862421]
    },
    end: {
      type: 'Point',
      coordinates: [-120.58022323, 38.87086037]
    },
    complete_date: new Date('2016-06-04T06:51:49.000Z'),
    start_date: new Date('2016-06-04T06:50:12.000Z')
  },
  {
    distance_travelled: 4289,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 5,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-96.99783262, 30.92510125]
    },
    end: {
      type: 'Point',
      coordinates: [-97.12728388, 30.82222187]
    },
    complete_date: new Date('2016-06-05T22:19:26.000Z'),
    start_date: new Date('2016-06-05T22:11:14.000Z')
  },
  {
    distance_travelled: 2107,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'SRX',
    year: 2012,
    rating: 4.88888888889,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.57098109, 31.10412217]
    },
    end: {
      type: 'Point',
      coordinates: [-97.6864222, 30.48194684]
    },
    complete_date: new Date('2016-06-05T23:57:20.000Z'),
    start_date: new Date('2016-06-05T23:51:38.000Z')
  },
  {
    distance_travelled: 2331,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-96.81624433, 31.01288834]
    },
    end: {
      type: 'Point',
      coordinates: [-97.24876636, 31.04101841]
    },
    complete_date: new Date('2016-06-06T16:30:00.000Z'),
    start_date: new Date('2016-06-06T16:24:31.000Z')
  },
  {
    distance_travelled: 1957,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Brown',
    make: 'BMW',
    model: 'X5',
    year: 2013,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.01192047, 30.95251868]
    },
    end: {
      type: 'Point',
      coordinates: [-97.71439638, 30.77270171]
    },
    complete_date: new Date('2016-06-07T01:53:29.000Z'),
    start_date: new Date('2016-06-07T01:46:34.000Z')
  },
  {
    distance_travelled: 10639,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'White',
    make: 'Nissan',
    model: 'Murano',
    year: 2015,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-96.81048554, 31.20519009]
    },
    end: {
      type: 'Point',
      coordinates: [-97.23728611, 30.74341714]
    },
    complete_date: new Date('2016-06-07T13:58:25.000Z'),
    start_date: new Date('2016-06-07T13:41:56.000Z')
  },
  {
    distance_travelled: 2180,
    driver_rating: 3,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'White',
    make: 'Nissan',
    model: 'Murano',
    year: 2015,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.41747856, 30.95036147]
    },
    end: {
      type: 'Point',
      coordinates: [-97.3596688, 30.31955354]
    },
    complete_date: new Date('2016-06-07T23:22:39.000Z'),
    start_date: new Date('2016-06-07T23:13:58.000Z')
  },
  {
    distance_travelled: 5872,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'White',
    make: 'Chevrolet',
    model: 'Tahoe',
    year: 2013,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.32967417, 30.70601143]
    },
    end: {
      type: 'Point',
      coordinates: [-97.18585699, 30.54692727]
    },
    complete_date: new Date('2016-06-06T02:48:27.000Z'),
    start_date: new Date('2016-06-06T02:38:58.000Z')
  },
  {
    distance_travelled: 10418,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Gray',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2008,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.36527271, 31.16727719]
    },
    end: {
      type: 'Point',
      coordinates: [-97.27891953, 31.1066616]
    },
    complete_date: new Date('2016-06-07T00:44:11.000Z'),
    start_date: new Date('2016-06-07T00:24:37.000Z')
  },
  {
    distance_travelled: 11582,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Brown',
    make: 'BMW',
    model: 'X5',
    year: 2013,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.62908873, 31.20752392]
    },
    end: {
      type: 'Point',
      coordinates: [-97.64566051, 30.95030768]
    },
    complete_date: new Date('2016-06-07T02:47:08.000Z'),
    start_date: new Date('2016-06-07T02:27:28.000Z')
  },
  {
    distance_travelled: 7176,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 4.90909090909,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.22269528, 30.98892856]
    },
    end: {
      type: 'Point',
      coordinates: [-97.21574126, 30.35251639]
    },
    complete_date: new Date('2016-06-07T21:47:54.000Z'),
    start_date: new Date('2016-06-07T21:26:23.000Z')
  },
  {
    distance_travelled: 285,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 5,
    Date: '2016-06-04',
    PRCP: 0.1,
    TMAX: 86,
    TMIN: 67,
    AWND: 4.9,
    GustSpeed2: 13,
    Fog: 1,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.58479012, 30.73872651]
    },
    end: {
      type: 'Point',
      coordinates: [-97.35755671, 31.19842631]
    },
    complete_date: new Date('2016-06-04T04:35:56.000Z'),
    start_date: new Date('2016-06-04T04:34:52.000Z')
  },
  {
    distance_travelled: 3305,
    driver_rating: 3,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 5,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.27707817, 30.76846625]
    },
    end: {
      type: 'Point',
      coordinates: [-97.65032591, 30.59190307]
    },
    complete_date: new Date('2016-06-05T23:35:57.000Z'),
    start_date: new Date('2016-06-05T23:29:20.000Z')
  },
  {
    distance_travelled: 2692,
    driver_rating: 3,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.37635923, 31.24501797]
    },
    end: {
      type: 'Point',
      coordinates: [-97.10379422, 30.62136689]
    },
    complete_date: new Date('2016-06-06T16:56:56.000Z'),
    start_date: new Date('2016-06-06T16:49:19.000Z')
  },
  {
    distance_travelled: 2694,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Silver',
    make: 'BMW',
    model: 'X5 M',
    year: 2013,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.00389083, 30.75561468]
    },
    end: {
      type: 'Point',
      coordinates: [-97.40428489, 31.22950266]
    },
    complete_date: new Date('2016-06-06T19:28:33.000Z'),
    start_date: new Date('2016-06-06T19:18:20.000Z')
  },
  {
    distance_travelled: 6711,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Ford',
    model: 'Explorer',
    year: 2015,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.31683494, 31.25771947]
    },
    end: {
      type: 'Point',
      coordinates: [-97.12589292, 30.96466564]
    },
    complete_date: new Date('2016-06-07T14:38:34.000Z'),
    start_date: new Date('2016-06-07T14:23:58.000Z')
  },
  {
    distance_travelled: 2120,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Gray',
    make: 'Toyota',
    model: 'Highlander',
    year: 2012,
    rating: 5,
    Date: '2016-06-05',
    PRCP: 0,
    TMAX: 88,
    TMIN: 68,
    AWND: 5.8,
    GustSpeed2: 14.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.4106376, 30.49315429]
    },
    end: {
      type: 'Point',
      coordinates: [-97.21642179, 30.74705309]
    },
    complete_date: new Date('2016-06-05T23:33:07.000Z'),
    start_date: new Date('2016-06-05T23:24:55.000Z')
  },
  {
    distance_travelled: 1439,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Gray',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2008,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.54173287, 30.67917318]
    },
    end: {
      type: 'Point',
      coordinates: [-96.87856875, 31.1076995]
    },
    complete_date: new Date('2016-06-06T20:05:42.000Z'),
    start_date: new Date('2016-06-06T20:02:45.000Z')
  },
  {
    distance_travelled: 10475,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Gray',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2008,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.34704629, 30.91497117]
    },
    end: {
      type: 'Point',
      coordinates: [-96.93901345, 30.74818682]
    },
    complete_date: new Date('2016-06-06T17:09:23.000Z'),
    start_date: new Date('2016-06-06T16:57:09.000Z')
  },
  {
    distance_travelled: 12648,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'White',
    make: 'Chevrolet',
    model: 'Tahoe',
    year: 2013,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.70897743, 30.38690315]
    },
    end: {
      type: 'Point',
      coordinates: [-97.57016901, 31.01476502]
    },
    complete_date: new Date('2016-06-06T23:10:54.000Z'),
    start_date: new Date('2016-06-06T22:45:34.000Z')
  },
  {
    distance_travelled: 4878,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'White',
    make: 'Chevrolet',
    model: 'Tahoe',
    year: 2013,
    rating: 5,
    Date: '2016-06-07',
    PRCP: 0,
    TMAX: 92,
    TMIN: 69,
    AWND: 2,
    GustSpeed2: 8.1,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-96.75351497, 30.49660786]
    },
    end: {
      type: 'Point',
      coordinates: [-97.27002858, 30.31813099]
    },
    complete_date: new Date('2016-06-07T00:57:56.000Z'),
    start_date: new Date('2016-06-07T00:45:51.000Z')
  },
  {
    distance_travelled: 2013,
    driver_rating: 5,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'Black',
    make: 'Cadillac',
    model: 'XTS',
    year: 2013,
    rating: 4.90909090909,
    Date: '2016-06-08',
    PRCP: 0,
    TMAX: 92,
    TMIN: 70,
    AWND: 2.7,
    GustSpeed2: 12.1,
    Fog: 1,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.49353421, 30.73735621]
    },
    end: {
      type: 'Point',
      coordinates: [-97.38300576, 31.09839296]
    },
    complete_date: new Date('2016-06-08T01:04:36.000Z'),
    start_date: new Date('2016-06-08T00:58:03.000Z')
  },
  {
    distance_travelled: 3468,
    driver_rating: null,
    rider_rating: 5,
    start_zip_code: null,
    end_zip_code: '',
    charity_id: null,
    requested_car_category: 'REGULAR',
    free_credit_used: null,
    surge_factor: 0,
    color: 'White',
    make: 'Chevrolet',
    model: 'Tahoe',
    year: 2013,
    rating: 5,
    Date: '2016-06-06',
    PRCP: 0,
    TMAX: 90,
    TMIN: 70,
    AWND: 4.3,
    GustSpeed2: 13,
    Fog: 0,
    HeavyFog: 0,
    Thunder: 0,
    start: {
      type: 'Point',
      coordinates: [-97.09061088, 31.16882804]
    },
    end: {
      type: 'Point',
      coordinates: [-97.34397047, 30.84112115]
    },
    complete_date: new Date('2016-06-06T01:28:35.000Z'),
    start_date: new Date('2016-06-06T01:20:05.000Z')
  }
]
