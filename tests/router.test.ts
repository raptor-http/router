import {
  assertArrayIncludes,
  assertEquals,
  assertRejects,
} from "jsr:@std/assert";

import {
  type Context as ContextType,
  Request,
  Response,
  Route,
  Router,
} from "../mod.ts";

import Context from "../src/http/context.ts";

Deno.test("test router accepts new route", () => {
  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: new URLPattern("/test-route", "http://test.com"),
    method: "GET",
    handler: (context: ContextType) => {
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
    handler: (context: ContextType) => {
      console.log(context);
    },
  });

  const routeTwo = new Route({
    name: "test.route_2",
    pathname: new URLPattern("/test-route-2", "http://test.com"),
    method: "GET",
    handler: (context: ContextType) => {
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
  const context = new Context(
    new Request(new URL("http://test.com/test-route")),
    new Response(null),
  );

  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: new URLPattern("/test-route", "http://test.com"),
    method: "GET",
    handler: (context: ContextType) => {
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
    handler: (context: ContextType) => {
      context.response.body = JSON.stringify({
        influence: true,
      });
    },
  });

  router.add(route);

  const context = new Context(
    new Request(new URL("http://test.com/unknown-route")),
    new Response(null),
  );

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

  const context = new Context(
    new Request(new URL("http://test.com/test/1")),
    new Response(null),
  );

  router.handler(context).then(() => {
    assertEquals(context.params.id, "1");
  });
});
