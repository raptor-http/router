import { assertArrayIncludes, assertEquals } from "jsr:@std/assert";

import Route from "../src/route.ts";
import Router from "../src/router.ts";
import type Context from "../src/route-context.ts";
import { Kernel } from "jsr:@raptor/framework@0.8.4";
import { HttpMethod } from "../src/enums/http-method.ts";

Deno.test("test router accepts new route", () => {
  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: "/test-route",
    method: HttpMethod.GET,
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
    pathname: "/test-route-1",
    method: HttpMethod.GET,
    handler: (context: Context) => {
      console.log(context);
    },
  });

  const routeTwo = new Route({
    name: "test.route_2",
    pathname: "/test-route-2",
    method: HttpMethod.GET,
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
  const kernel = new Kernel();

  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: "/test-route",
    method: HttpMethod.GET,
    handler: () => {
      return {
        influence: true,
      };
    },
  });

  router.add(route);

  kernel.add((context: Context) => router.handler(context));

  const response = await kernel.respond(
    new Request(
      `${Deno.env.get("APP_URL")}/test-route`,
    ),
  );

  const body = await response.json();

  assertEquals(body, { influence: true });
});

Deno.test("test unknown route throws not found", async () => {
  const kernel = new Kernel();

  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: "/test-route",
    method: HttpMethod.GET,
    handler: () => {
      return {
        influence: true,
      };
    },
  });

  router.add(route);

  kernel.add((context: Context) => router.handler(context));

  const response = await kernel.respond(
    new Request(
      `${Deno.env.get("APP_URL") as string}/another-route`,
    ),
  );

  assertEquals(response.status, 404);
});

Deno.test("test context contains route params", async () => {
  const kernel = new Kernel();

  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: "/test/:id",
    method: HttpMethod.GET,
    handler: (context: Context) => {
      context.response.headers.set("content-type", "application/json");

      return {
        id: context.params.id,
      };
    },
  });

  router.add(route);

  kernel.add((context: Context) => router.handler(context));

  const response = await kernel.respond(
    new Request(
      `${Deno.env.get("APP_URL") as string}/test/1`,
    ),
  );

  assertEquals(await response.json(), { id: "1" });
});
