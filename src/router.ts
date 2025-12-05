import type Route from "./route.ts";
import ParamParser from "./param-parser.ts";
import RouteContext from "./route-context.ts";
import { type Context, NotFound } from "jsr:@raptor/framework@0.8.3";

export default class Router {
  /**
   * All loaded routes.
   */
  public routes: Route[] = [];

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
    this.routes = [
      ...this.routes,
      route,
    ];
  }

  /**
   * Add one or more routes to the router.
   *
   * @param routes One or more route definitions.
   */
  public addRoutes(routes: Route[]): void {
    this.routes = [...this.routes, ...routes];
  }

  /**
   * Handle the current http context and process routes.
   *
   * @param context The current http context.
   * @returns An unknown data type.
   * @throws {NotFound | TypeError}
   */
  public handler(context: Context): unknown {
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

    // Determine any route parameters that might be present.
    const parser = new ParamParser(
      new URLPattern(route.options.pathname, request.url),
      request.url,
    );

    const params = parser.parse();

    // Pass the route parameters to the route context.
    routeContext.params = params;

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
    const route = this.routes.find(({ options }) => {
      const pattern = new URLPattern(options.pathname, request.url);

      return pattern.exec(request.url);
    });

    if (!route) {
      return null;
    }

    return route;
  }
}
