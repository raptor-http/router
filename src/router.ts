import type Route from "./route.ts";
import RouteContext from "./route-context.ts";
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
    // Are we dealing with a multi-method route?
    const methods = Array.isArray(route.options.method)
      ? route.options.method
      : [route.options.method];

    // Is the route static?
    const isStatic = !route.options.pathname.includes(":") &&
      !route.options.pathname.includes("*");

    // Run through each method and register route.
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
  public handle(context: Context): unknown {
    // Establish a new context from the base.
    const routeContext = new RouteContext(
      context.request,
      context.response,
    );

    const { request } = routeContext;

    // Attempt to match a route from the request.
    const route = this.getRouteFromRequest(request);

    // If no matches were found or the method is incorrect, throw.
    if (!route || !this.isValidHttpMethod(request, route)) {
      throw new NotFound();
    }

    // Pass the route parameters to the route context.
    routeContext.params = route.extractParams(request.url);

    // If no handler function exists on route, throw.
    if (typeof route.options.handler !== "function") {
      throw new TypeError("No handler function was provided for route");
    }

    return route.options.handler(routeContext);
  }

  /**
   * Check the validity of the current HTTP method against the route options.
   *
   * @param request The current HTTP request object.
   * @param route The current matched route.
   * @returns The validity of the current HTTP method.
   */
  private isValidHttpMethod(request: Request, route: Route): boolean {
    if (request.method === route.options.method) {
      return true;
    }

    if (Object.values(route.options.method).includes(request.method)) {
      return true;
    }

    return false;
  }

  /**
   * Get a matching route from the request.
   *
   * @param request The current http request.
   * @returns A matched route definition.
   */
  private getRouteFromRequest(request: Request): Route | null {
    const url = new URL(request.url);

    const staticKey = `${request.method}:${url.pathname}`;
    const staticRoute = this.staticRoutes.get(staticKey);

    if (staticRoute) return staticRoute;

    const dynamicRoutes = this.dynamicRoutesByMethod.get(request.method) ?? [];

    return dynamicRoutes.find((route) => {
      return route.pattern.test(request.url);
    }) ?? null;
  }
}
