<p align="center">
  <img src="https://github.com/raptor-http/brand/raw/main/assets/logo.svg" width="150" height="150" alt="Raptor Framework" />
</p>

<p align="center">
  <a href="https://github.com/briward/raptor-router/actions"><img src="https://github.com/briward/raptor-router/workflows/ci/badge.svg" alt="Build Status"></a>
  <a href="https://jsr.io/@raptor/router"><img src="https://jsr.io/badges/@raptor/router" /></a>
  <a href="https://jsr.io/@raptor/router score"><img src="https://jsr.io/badges/@raptor/router/score" /></a>
  <a href="https://jsr.io/@raptor"><img src="https://jsr.io/badges/@raptor" alt="" /></a>
</p>

## Raptor Router

See more information about the Raptor framework here: <a href="https://jsr.io/@raptor/framework">https://jsr.io/@raptor/framework</a>.

## Usage

> [!NOTE]
> This is currently under heavy development and is not yet suitable for production use. Please proceed with caution.

### Installation

To start using the router, simply install into an existing Raptor application via the CLI or import it directly from JSR.

#### Using the Deno CLI

```
deno add jsr:@raptor/router
```

#### Importing with JSR

Raptor is also available to import directly via JSR:
[https://jsr.io/@raptor/router](https://jsr.io/@raptor/router)

### Usage

The built-in router operates similarly to standard Raptor middleware, enabling you to define routes using Web API standard URL patterns. For further details, visit [mozilla.org/URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern).

#### Adding routes to the router

```ts
import { Kernel, Context } from "jsr:@raptor/framework";
import { Router, Route, HttpMethod } from "jsr:@raptor/router";

const app = new Kernel();

const router = new Router();

const route = new Route({
  name: "index",
  method: HttpMethod.GET,
  pathname: "/",
  handler: () => 'Hello, Dr Malcolm!'
});

router.add(route);

app.add((context: Context) => router.handler(context));

app.serve({ port: 8000 });
```

#### Route parameters

Route parameter values are processed and available via the router's context object (`context.params`) if they are found in the route's pathname. Make sure to import the router's `Context` object, rather than the base Raptor `Context` object.

```ts
import { Route, Context, HttpMethod } from "jsr:@raptor/router";

/* ... */

const route = new Route({
  name: "person.read",
  method: HttpMethod.GET,
  pathname: "/person/:name";
  handler: (context: Context) => {
    const { name } = context.params;

    return `Hello ${name}`;
  }
});
```

## License

_Copyright 2024, @briward. All rights reserved. The framework is licensed under
the MIT license._
