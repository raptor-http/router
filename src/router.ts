import type Route from "./route.ts";
import ParamParser from "./param-parser.ts";

import {
  type Context,
  type Middleware,
  NotFound,
} from "jsr:@raptor/framework@0.2.0";

/**
 * The application router.
 */
export default class Router implements Middleware {
  /**
   * All loaded routes.
   */
  public routes: Route[];

  /**
   * Initialise a router object.
   *
   * @constructor
   */
  constructor() {
    this.routes = [];
  }

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
   * @returns void
   * @throws {NotFound | TypeError}
   */
  public async handler(context: Context): Promise<void> {
    const { request } = context;

    const route = this.getRouteFromRequest(request);

    if (!route || request.method !== route.options.method) {
      throw new NotFound();
    }

    const parser = new ParamParser(route.options.pathname, request.url);
    const params = parser.parse();

    context.params = params;

    if (typeof route.options.handler !== "function") {
      throw new TypeError("No handler function was provided for route");
    }

    await route.options.handler(context);
  }

  /**
   * Get a matching route from the request.
   *
   * @param request The current http request.
   * @returns A matched route definition.
   */
  private getRouteFromRequest(request: Request): Route | null {
    const route = this.routes.find(({ options }) =>
      options.pathname.exec(request.url)
    );

    if (!route) {
      return null;
    }

    return route;
  }
}
