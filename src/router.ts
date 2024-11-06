import { NotFound } from "jsr:@raptor/framework@0.3.0";

import ParamParser from "./param-parser.ts";

import type Route from "./route.ts";
import type { Context } from "./interfaces/context.ts";

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
   * @returns any Returns any value from handler.
   * @throws {NotFound | TypeError}
   */
  public handler(context: Context): any {
    const { request } = context;

    const route = this.getRouteFromRequest(request);

    if (!route || request.method !== route.options.method) {
      throw new NotFound();
    }

    const parser = new ParamParser(
      new URLPattern(route.options.pathname, request.url),
      request.url,
    );

    const params = parser.parse();

    context.params = params;

    if (typeof route.options.handler !== "function") {
      throw new TypeError("No handler function was provided for route");
    }

    return route.options.handler(context);
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
