<p align="center">
  <img src="./assets//logo.svg" width="300" />
</p>

<p align="center">
  <a href="https://github.com/briward/raptor-router/actions"><img src="https://github.com/briward/raptor-router/workflows/ci/badge.svg" alt="Build Status"></a>
  <a href="jsr.io/@raptor/router"><img src="https://jsr.io/badges/@raptor/router?logoColor=3A9D95&color=3A9D95&labelColor=083344" /></a>
  <a href="jsr.io/@raptor/router score"><img src="https://jsr.io/badges/@raptor/router/score?logoColor=3A9D95&color=3A9D95&labelColor=083344" /></a>
  <a href="https://jsr.io/@raptor"><img src="https://jsr.io/badges/@raptor?logoColor=3A9D95&color=3A9D95&labelColor=083344" alt="" /></a>
</p>

# About Raptor

See more information about the Raptor framework here: <a href="https://jsr.io/@raptor/framework">https://jsr.io/@raptor/framework</a>.

# Usage

> [!NOTE]
> This is under heavy development and not yet suitable for production use, you
> have been warned.

## Installation

### Using the Deno CLI

```
deno add @raptor/router
```

### Importing with JSR

Raptor is also available to import directly via JSR:
[https://jsr.io/@raptor/router](https://jsr.io/@raptor/router)

```ts
import { Route, Router } from "jsr:@raptor/router";
```

## Usage

The built-in router works in the same way as regular Raptor middleware, allowing you to pass in routes using Web API standard URL patterns. See [mozilla.org/URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)
for more information.

### Adding routes to the router

```ts
import { Router, Route } from "jsr:@raptor/router";
import { Kernel, type Context } from "jsr:@raptor/framework";

const app = new Kernel();

const router = new Router();

const route = new Route({
  name: "person.read",
  method: "GET",
  pathname: new URLPattern("/person/:name");
  handler: (context: Context) => {
    const { name } = context.params;

    context.response.body = `Hello ${name}`;
  }
});

router.add(route);

app.add(router);
```

### Route parameters

Route parameters are processed and available via Context (`context.params`) if
they are present in the URLPattern pathname.

### Returning JSON responses

If a JSON object is assigned to the response body then the response content-type will be automatically set to `application/json`. You can override the header by manually assigning it within a middleware callback as follows:

```ts
app.add({
  handler: (context: Context) => {
    context.response.headers.set('content-type', 'text/plain');
  }
});
```

# License

_Copyright 2024, @briward. All rights reserved. The framework is licensed under
the MIT license._
