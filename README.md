# Trip Query Service

An simple implementation for trip data querying &amp; reporting use case

## Running the project

### As a Local Standalone App

> Prerequisite: [Node LTS](https://nodejs.org/en/download/)

1. Create a `.env` file with content:

   ```properties
   PORT=3000
   LOGGER_NAME=default
   TOKEN_USER=*****
   TOKEN_PASS=*****
   JWT_SECRET=*****
   MONGO_URI=*****
   MONGO_DB_NAME=*****
   ```

2. Install dependencies and run the project:

```sh
$ npm i
$ npm run dev
```

3. The application should be up on `http://localhost:3000` now.

Check [running on cloud](#on-cloud) for a more straightforward procedure.

### On Cloud

Unlike [local version](#as-a-local-standalone-app) above, this is easy as pie: Create a new [release](https://docs.github.com/en/github/administering-a-repository/releasing-projects-on-github/managing-releases-in-a-repository) on the [GitHub repository](https://github.com/vahdet/trip-query-service), and build & deployment processes will be triggered as a [GitHub action](https://github.com/features/actions) right away.

## Technical Decisions & Discussion

### Dependency Rule

AFAIK, the term [dependency rule](https://www.informit.com/articles/article.aspx?p=2832399), was coined by Robert C. Martin in the book [Clean Architecture](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164). So, the outer layers (e.g. [`app`](./src/app)) may depend on inner ones (e.g. [`domain`](./src/domain)), but not vice versa.

### Dependency Inversion

Although ES6 has [class](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) structure, it does not have Java-like interfaces. At this point TypeScript interfaces are here to rescue: We can make an ES6 class _extend_ a TypeScript interface implementing the methods declared. Examples of this approach in this project can be observed at [`service.ts`](./src/app/service.ts) and [`repository.ts`](./src/app/repository.ts).

### MongoDB Node Driver vs Mongoose

I used [official MongoDB Node Driver](https://mongodb.github.io/node-mongodb-native/) to keep it simple. In cases which generating DB models seriously make sense [Mongoose](https://mongoosejs.com/) can be deemed.

### TypeScript Interface vs Type

The [document](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces) states that TypeScript's `type` and `interface` can be used **interchangeably**: except the fact that `type` is not open for extension. So, I used `interface` where extensibility was needed or things were rather vague and `type` when thought that definition would not be inherited by any means.

### REST vs GraphQL

Most of the use cases here require complex queries: at least two coordinate values, plus some optional arguments. So, a GraphQL endpoint which the query is sent in request body could be a fit. However, for simplicity, I stuck with REST.

### Documentation & OpenAPI3 Specs

I intended to put some spec (like [`tsoa`](https://tsoa-community.github.io/docs/)), but it started getting cumbersome for a simple project. I guess I won't bring it into the game despite it is enlisted in the requirements 🤷

Instead, I am planning to hand a Postman collection of sample requests out.

### Environment Variables

One of my favorite 12-Factor Apps items promote [externalized configurations](https://12factor.net/config) (even _dotenv_ library [does so](https://github.com/motdotla/dotenv#should-i-commit-my-env-file). So, I did not commit [`.env`](./.env) as the config base for the containerized mode. Instead, I made use of [my AWS ECS task definition file](./trip-task-definition.json) since it is also a [legit solution](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/taskdef-envfiles.html).

### Monolithic Structure

A monolith is **not** always evil, indeed it enhances time to market for smaller, one-man applications by eliminating the network concerns, separate configurations and deployments etc. That's why I dared to deny _Single Responsibility Principle_ (at application level) and used a single deployable with **authentication** logic embedded.

### See Also

- [Longitude/Latitude Order on MongoDB entries](https://docs.mongodb.com/manual/geospatial-queries/#legacy-coordinate-pairs)

- [TSDoc](https://tsdoc.org/)

- [express-validator](https://express-validator.github.io/docs/)

- [Bug: Jest config file with commonjs extension (.cjs) w/ ts-node 10](https://github.com/facebook/jest/issues/11453#issuecomment-868806653)
