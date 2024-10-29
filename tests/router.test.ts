import {
  assertArrayIncludes,
  assertEquals,
  assertRejects,
} from "jsr:@std/assert";

import { type Context, Request, Response } from "jsr:@raptor/framework@0.2.0";

import { Route, Router } from "../mod.ts";

Deno.test("test router accepts new route", () => {
  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: new URLPattern("/test-route", "http://test.com"),
    method: "GET",
    handler: (context: Context) => {
      console.log(context);
    },
  });

  router.add(route);

  assertEquals(router.routes[0].options.name, route.options.name);
});

Deno.test("test router accepts new routes", () => {
  const router = new Router();

  const routeOne = new Route({
    name: "test.route_1",
    pathname: new URLPattern("/test-route-1", "https://test.com"),
    method: "GET",
    handler: (context: Context) => {
      console.log(context);
    },
  });

  const routeTwo = new Route({
    name: "test.route_2",
    pathname: new URLPattern("/test-route-2", "http://test.com"),
    method: "GET",
    handler: (context: Context) => {
      console.log(context);
    },
  });

  router.add([routeOne, routeTwo]);

  assertArrayIncludes(router.routes, [
    routeOne,
    routeTwo,
  ]);
});

Deno.test("test route influences context response", async () => {
  const context = {
    request: new Request(new URL("http://test.com/test-route")),
    response: new Response(null),
  } as Context;

  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: new URLPattern("/test-route", "http://test.com"),
    method: "GET",
    handler: (context: Context) => {
      context.response.body = {
        influence: true,
      };
    },
  });

  router.add(route);

  await router.handler(context);

  const response = await new Response(context.response.body).text();

  assertEquals(response, JSON.stringify({ influence: true }));
});

Deno.test("test unknown route throws not found", () => {
  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: new URLPattern("/test-route", "http://test.com"),
    method: "GET",
    handler: (context: Context) => {
      context.response.body = JSON.stringify({
        influence: true,
      });
    },
  });

  router.add(route);

  const context = {
    request: new Request(new URL("http://test.com/unknown-route")),
    response: new Response(null),
  } as Context;

  assertRejects(() => router.handler(context));
});

Deno.test("test context contains route params", () => {
  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: new URLPattern("/test/:id", "http://test.com"),
    method: "GET",
    handler: () => {},
  });

  router.add(route);

  const context = {
    request: new Request(new URL("http://test.com/test/1")),
    response: new Response(null),
  } as Context;

  router.handler(context).then(() => {
    assertEquals(context.params.id, "1");
  });
});
