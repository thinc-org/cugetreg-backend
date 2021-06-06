<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## CU Get Reg API

Backend service for [CU Get Reg](https://cugetreg.com).

This project is powered by NestJS and GraphQL. For official documentation, see [here](https://docs.nestjs.com/).

## Documentation

The CU Get Reg API Documentation can be found [here](./DOCUMENTATION.md).

## Prerequisites

1. Node 14 LTS
2. Yarn
3. Docker-compose

## Installation

1. Install dependencies.

```bash
$ yarn install
```

2. Copy and rename `.env.template` to `.env`

```bash
$ cp .env.template .env
```

## Running MongoDB locally

Make sure port `27017` is available.

```bash
$ docker-compose up
```

MongoDB should be up and running on `http://localhost:27017`

In case of `Bind for 0.0.0.0:27017 failed: port is already allocated`, make sure port `27017` is available.

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e

# test coverage
$ yarn test:cov
```
