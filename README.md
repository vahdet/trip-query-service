# trip-query-service

An simple implementation for trip data querying &amp; reporting use case

## Running the project

## Decisions & Discussion

### Dependency Rule

AFAIK, the term [dependency rule](https://www.informit.com/articles/article.aspx?p=2832399), was coined by Robert C. Martin in the book [Clean Architecture](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164). So, the outer layers (e.g. [`app`](./app)) may depend on inner ones (e.g. [`domain`](./domain)) but not vice versa.

### Dependency Inversion

Although ES6 has class structure, it does not have Java-like interfaces (TypeScript interfaces are a different beast). There are tools for it like [InversifyJS](https://github.com/inversify/InversifyJS), however I may not have time to implement it.

### MongoDB Node Driver vs Mongoose

I solely used [official MongoDB Node Driver](https://mongodb.github.io/node-mongodb-native/) to keep it simple. In cases which generating DB models seriously make sense [Mongoose](https://mongoosejs.com/) can be considered.

### TypeScript Interface vs Type

TypeScript [document](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces) states that `type` and `interface` can be used interchangeably: except the fact that `type` is not open for extension. So, I used `interface` where extensibility was needed or things were rather vague and `type` when thought that definition would not be inherited by any means.

### REST vs GraphQL

Most of the use cases here require complex queries: at least two coordinate values, plus some optional arguments. So, a GraphQL endpoint which the query is sent in request body could be a fit. However, for simplicity, I stuck with REST.

### OpenAPI3 & Swagger

I intended to put some spec but it started getting cumbersome for a simple project. I guess I won't bring it into the game.

### Monolithic Structure

A monolith is not always evil, indeed it enhances time to market for smaller, one-man applications by eliminating the network concerns, separate configurations and deployments etc. That's why I dared to deny _Single Responsibility Principle_ (at application level) and used a single deployable with **authentication** logic embedded.

### See Also

- [Longitude/Latitude Order on MongoDB entries](https://docs.mongodb.com/manual/geospatial-queries/#legacy-coordinate-pairs)

- [TSDoc](https://tsdoc.org/)
