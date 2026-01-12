import type Route from "./route.ts";
import { type Context, NotFound } from "@raptor/framework";

export default class Router {
  /**
   * All stored static routes.
   */
  public staticRoutes: Map<string, Route> = new Map();

  /**
   * All stored dynamic routes, by method.
   */
  public dynamicRoutesByMethod: Map<string, Route[]> = new Map();

  /**
   * Add one or more routes to the router.
   *
   * @param routes One or many routes.
   * @returns void
   */
  public add(routes: Route | Route[]): void {
    if (Array.isArray(routes)) {
      this.addRoutes(routes);
      return;
    }

    this.addRoute(routes);
  }

  /**
   * Add a single route to the router.
   *
   * @param route A single route definition.
   */
  public addRoute(route: Route): void {
    const methods = Array.isArray(route.options.method)
      ? route.options.method
      : [route.options.method];

    const isStatic = !route.options.pathname.includes(":") &&
      !route.options.pathname.includes("*");

    methods.forEach((method) => {
      if (isStatic) {
        const key = `${method}:${route.options.pathname}`;
        this.staticRoutes.set(key, route);
        return;
      }

      if (!this.dynamicRoutesByMethod.has(method)) {
        this.dynamicRoutesByMethod.set(method, []);
      }

      this.dynamicRoutesByMethod.get(method)!.push(route);
    });
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
   * Handle the current http context and process routes.
   *
   * @param context The current http context.
   * @returns An unknown data type.
   * @throws {NotFound | TypeError}
   */
  public handle(context: Context): Promise<unknown> {
    const { request } = context;

    let url: URL;

    try {
      url = new URL(request.url);
    } catch {
      throw new NotFound();
    }

    const route = this.getRouteFromRequest(request, url);

    if (!route) {
      throw new NotFound();
    }

    // Initialize params if it doesn't exist.
    if (!context.request.params) {
      context.request.params = {};
    }

    // Extract and assign params.
    context.request.params = route.extractParams(url);

    if (typeof route.options.handler !== "function") {
      throw new TypeError("No handler function was provided for route");
    }

    // Excute the route's middleware, then finally the handler.
    return this.executeRouteMiddleware(route, context, 0);
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
    route: Route,
    context: Context,
    index: number,
  ): Promise<unknown> {
    const config = route.options.middleware;

    // Simplify by always using an array.
    const middleware = !config ? [] : Array.isArray(config) ? config : [config];

    // If we've executed all middleware, call the route handler.
    if (index >= middleware.length) {
      return Promise.resolve(route.options.handler(context));
    }

    const current = middleware[index];

    const next = (): Promise<unknown> => {
      return this.executeRouteMiddleware(route, context, index + 1);
    };

    return Promise.resolve(current(context, next));
  }

  /**
   * Get a matching route from the request.
   *
   * @param request The current http request.
   * @param url The current request URL.
   *
   * @returns A matched route definition.
   */
  private getRouteFromRequest(request: Request, url: URL): Route | null {
    const staticKey = `${request.method}:${url.pathname}`;
    const staticRoute = this.staticRoutes.get(staticKey);

    if (staticRoute) return staticRoute;

    const dynamicRoutes = this.dynamicRoutesByMethod.get(request.method) ?? [];

    return dynamicRoutes.find((route) => {
      if (route.paramRegex) {
        return route.paramRegex.test(url.pathname);
      }

      return route.pattern.test(request.url);
    }) ?? null;
  }
}
