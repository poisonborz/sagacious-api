<img src="https://github.com/poisonborz/sagacious-api/blob/af001229047f5074118aa016ef54ab95b7b8d26e/docs/graphql/template/images/logo.png">

A reasonable, robust and well-equipped GraphQL + REST API. Hanging somewehere between a boilerplate and a template, it has a lot of bells and whistles in place for a production ready API derivate.

- A structure that allows singular handling of GraphQL + REST requests with a thin overhead and manual mapping of methods
- Zero configuration needed for endpoint creation/routing/model aggregation, handlers, GraphQL items and definitions - just follow the pattern in `/endpoints` and there is no need for manual imports or plumbing
- File uploads to an S3-compatible host
- Dataloaders for improved speed and per-request caching
- Auth/refresh token based JWT auth, with each request passing rich context to handlers
- Easily extensible for per-role capabilites to restrict operations
- Fully multi-language
- Automatic documentation generation for models (themed template provided)
- Email sending with Squirrelly templates
- Clients are served hashed id-s to obscure entity counts
- DB migrations via Flyway
- Sequelize ORM with easily defined relations in a separate file
- Dockerized

## Structure

### Models

The example use case is a simple warehouse management system. The relations are roughly:

- **Article** - has a **Type** and **Category**. Are assigned to **Group**s.
- **Group** - groups have parents and childrens and form a tree, with a root group at the top. They are assigned **User**s and **Article**s.
- **User** - has a **Role**. Are assigned to Groups.
- **Language**, **Translation** - used to define available language  and specific translation instances that have to be available in all **Language**s

### Methods

Endpoints that are not strictly related to a model are called methods. The single example method is `ReportClientEvent`, that is used to server-side track events actions made on/reported by a client to an Analytics provider.

## Usage

Environment: [Node](https://nodejs.org/en/) 14+, Docker (optional)

- Either do a `docker-compose up -d`
- or to execute  locally, `npm install` in the project root and start a separate MySQL server.

Start the server with either `npm run dev` or `npm run prod`. Point your browser to `localhost:4400` and see the API splash screen that points you to the documentation, where you can learn more on how queries are made.
