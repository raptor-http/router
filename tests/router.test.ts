import "npm:reflect-metadata@0.2.2";

import { container } from "npm:tsyringe@^4.8.0";

import { assertArrayIncludes, assertEquals } from "jsr:@std/assert";

import { Kernel, Request } from "jsr:@raptor/framework@0.3.0";

import Route from "../src/route.ts";
import Router from "../src/router.ts";
import type { Context } from "../src/interfaces/context.ts";

Deno.test("test router accepts new route", () => {
  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: "/test-route",
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
    pathname: "/test-route-1",
    method: "GET",
    handler: (context: Context) => {
      console.log(context);
    },
  });

  const routeTwo = new Route({
    name: "test.route_2",
    pathname: "/test-route-2",
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
  const kernel = new Kernel();

  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: "/test-route",
    method: "GET",
    handler: (context: Context) => {
      context.response.body = {
        influence: true,
      };
    },
  });

  router.add(route);

  kernel.add(router);

  const response = await kernel["handleResponse"](
    new Request("http://test.com/test-route"),
  );

  const body = await response.text();

  assertEquals(body, JSON.stringify({ influence: true }));

  container.reset();
});

Deno.test("test unknown route throws not found", async () => {
  const kernel = new Kernel();

  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: "/test-route",
    method: "GET",
    handler: (context: Context) => {
      context.response.body = JSON.stringify({
        influence: true,
      });
    },
  });

  router.add(route);

  kernel.add(router);

  const response = await kernel["handleResponse"](
    new Request("http://test.com/unknown-route"),
  );

  assertEquals(response.status, 404);

  container.reset();
});

Deno.test("test context contains route params", async () => {
  const kernel = new Kernel();

  const router = new Router();

  const route = new Route({
    name: "test.route",
    pathname: "/test/:id",
    method: "GET",
    handler: (context: Context) => {
      context.response.headers.set("content-type", "application/json");
      context.response.body = {
        id: context.params.id,
      };
    },
  });

  router.add(route);

  kernel.add(router);

  const response = await kernel["handleResponse"](
    new Request("http://test.com/test/1"),
  );

  assertEquals(await response.json(), { id: "1" });

  container.reset();
});
