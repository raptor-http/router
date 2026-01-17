import { type Context, NotFound } from "@raptor/framework";

import Tree from "./tree.ts";
import type Route from "./route.ts";
import type RouteGroup from "./route-group.ts";
import HttpMethod from "./enums/http-method.ts";
import normalisePath from "./utilities/normalise-path.ts";
import type { TreeMatchResult } from "./interfaces/tree-match-result.ts";

export default class Router {
  private trees: Map<HttpMethod, Tree> = new Map();

  /**
   * Add one or more routes to the router.
   *
   * @param routes One or many routes, either directly or via group(s).
   * @returns void
   */
  public add(routes: Route | RouteGroup | Route[] | RouteGroup[]): void {
    if (Array.isArray(routes) && this.isRoute(routes[0])) {
      this.addRoutes(routes as Route[]);

      return;
    }

    if (Array.isArray(routes) && this.isRouteGroup(routes[0])) {
      this.addRouteGroups(routes as RouteGroup[]);

      return;
    }

    if (Array.isArray(routes)) {
      return;
    }

    if (this.isRoute(routes)) {
      this.addRoute(routes as Route);

      return;
    }

    if (this.isRouteGroup(routes)) {
      this.addRouteGroup(routes as RouteGroup);
    }
  }

  /**
   * Add a single route to the router.
   *
   * @param route A single route definition.
   */
  public addRoute(route: Route): void {
    let config = route.options.method;

    if (!config) {
      config = HttpMethod.GET;
    }

    const method = HttpMethod[config as keyof typeof HttpMethod];

    if (!this.trees.has(method)) {
      this.trees.set(method, new Tree());
    }

    this.trees.get(method)!.add(route);
  }

  /**
   * Add one or more routes to the router.
   *
   * @param routes One or more route definitions.
   */
  public addRoutes(routes: Route[]): void {
    routes.forEach((route) => this.addRoute(route));
  }

  /**
   * Add a single route group to the router.
   *
   * @param group A single group route definition.
   */
  public addRouteGroup(group: RouteGroup): void {
    const { routes } = group;

    this.addRoutes(routes);
  }

  /**
   * Add one or more route groups to the router.
   *
   * @param groups One or more route definitions.
   */
  public addRouteGroups(groups: RouteGroup[]): void {
    groups.forEach((group) => this.addRouteGroup(group));
  }

  /**
   * Handle the current http context and process routes.
   *
   * @param context The current http context.
   * @returns An unknown data type.
   * @throws {NotFound | TypeError}
   */
  public handle(context: Context): Promise<unknown> {
    const { request } = context;

    const { method } = request;

    const pathname = this.getPathnameFromUrl(request.url);

    const match = this.trees
      .get(HttpMethod[method as keyof typeof HttpMethod])!
      .match(pathname);

    if (!match) {
      throw new NotFound();
    }

    if (match.params) {
      context.request.params = match.params;
    }

    if (typeof match.handler !== "function") {
      throw new TypeError("No handler function was provided for route");
    }

    // Execute the route's middleware, then finally the handler.
    return this.executeRouteMiddleware(match, context, 0);
  }

  /**
   * Check if an object is a route.
   *
   * @param item A route or route group.
   * @returns Whether the argument is a route object.
   */
  private isRoute(item: Route | RouteGroup): boolean {
    return "method" in item.options;
  }

  /**
   * Check if an object is a route group.
   *
   * @param item A route or route group.
   * @returns Whether the argument is a route group object.
   */
  private isRouteGroup(item: Route | RouteGroup): boolean {
    return "routes" in item;
  }

  /**
   * Execute route middleware with next() callback pattern.
   *
   * @param route The route being processed.
   * @param context The context from the request.
   * @param index Current middleware index.
   * @returns The response from handler or middleware.
   */
  private executeRouteMiddleware(
    match: TreeMatchResult,
    context: Context,
    index: number,
  ): Promise<unknown> {
    const config = match.middleware;

    // Simplify by always using an array.
    const middleware = !config ? [] : Array.isArray(config) ? config : [config];

    // If we've executed all middleware, call the route handler.
    if (index >= middleware.length) {
      return Promise.resolve(match.handler(context));
    }

    const current = middleware[index];

    const next = (): Promise<unknown> => {
      return this.executeRouteMiddleware(match, context, index + 1);
    };

    return Promise.resolve(current(context, next));
  }

  /**
   * Get the pathname from the URL.
   *
   * @param url The URL of the request.
   * @returns The pathname extracted from the URL.
   */
  private getPathnameFromUrl(url: string): string {
    const pathStart = url.indexOf("/", 8);

    if (pathStart === -1) {
      throw new NotFound();
    }

    const queryStart = url.indexOf("?", pathStart);
    const hashStart = url.indexOf("#", pathStart);

    let pathEnd = url.length;

    if (queryStart !== -1) {
      pathEnd = queryStart;
    }

    if (hashStart !== -1 && hashStart < pathEnd) {
      pathEnd = hashStart;
    }

    return normalisePath(url.substring(pathStart, pathEnd));
  }
}
