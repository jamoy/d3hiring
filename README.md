# D3Hiring Assessment

![CI](https://github.com/jamoy/d3hiring/workflows/CI/badge.svg)

This assessement is taken from: https://gist.github.com/d3hiring/4d1415d445033d316c36a56f0953f4ef

You can run the test suite by hitting this IP: `128.199.147.222:8400`.

Postman collection is exported to this [postman file](postman.json).

### Setup

Get up and running quickly with docker-compose

```
docker-compose -f stack.yml up
```

or run the whole thing manually by

1. Getting mysql in your docker daemon running via `docker run --name mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_PASSWORD=password -e MYSQL_USER=mysql -e MYSQL_DATABASE=d3hiring -p 3306:3306 -d mysql:latest`
2. `mv` the `.env.sample` to `.env` so you can modify the environment variables loaded
3. run the api using `yarn dev` which will load typscript in development mode.

You can build the codebase and run it separately via

```
yarn build
docker build -t d3hiring .
docker run -e NODE_ENV=production -e MYSQL_HOST=mysql -p 8400:8400 d3hiring
```

- make sure you modify `MYSQL_HOST` to point to the correct `HOST`, else the service won't know where the database is.

### Authorization

1. Before running requests, make sure you go to `/api/authorize` and get your token.
2. Add the `token` into your Authorization header as `Authorization: Bearer ${token}`
3. Run all subsequent requests using the above

### Testing

Tests are located in the [`test`](test) directory

```
yarn test
```

### Architecture Decision Records

1. @mention parsing uses regex and does not guarantee email validity
2. The codebase uses `synchronize: true` in TypeORM for convenience. Of course, this should not be done in production.
3. When a student OR teacher does not exist in a request, it is created. If it exists, it uses the existing record.
4. Sample auth via JWT is implemented in [`src/authorizer/token.ts`](src/authorizer/token.ts)
5. OAS3 is implemented up front and have rudimentary validations baked in
6. Starting docker-compose will have the server throw errors because MySQL is not yet available. I did not include a wait time for this.
7. Request logging is enabled for verbosity
8. No SSL cert is implemented on the Digital Ocean Droplet, however it is easy to apply via AWS CF, CF, or DO.
9. CD uses scp and ssh. no fancy deployments here.
