import type Route from "./route.ts";
import normalisePath from "./utilities/normalise-path.ts";
import type { RouteGroupOptions } from "./interfaces/route-group-options.ts";

/**
 * The route group definition.
 */
export default class RouteGroup {
  /**
   * A configurable option set for a route.
   */
  options: RouteGroupOptions;

  /**
   * All stored routes for the group.
   */
  routes: Route[] = [];

  constructor(options: RouteGroupOptions) {
    this.options = options;
  }

  public add(routes: Route | Route[]) {
    if (Array.isArray(routes)) {
      this.addRoutes(routes);

      return;
    }

    this.addRoute(routes);
  }

  public addRoute(route: Route) {
    const { name, prefix, middleware } = this.options;

    // Attach any name prefixes from the group.
    if (name) {
      route.options.name = name + route.options.name;
    }

    // Attach any pathname prefixes from the group.
    if (prefix) {
      const pathname = `${prefix}/${route.options.pathname}`;

      route.options.pathname = normalisePath(pathname);
    }

    // Attach any middleware from the group.
    if (middleware) {
      const normalised = Array.isArray(middleware) ? middleware : [middleware];

      const routeMiddleware = route.options.middleware
        ? (Array.isArray(route.options.middleware) ? route.options.middleware : [route.options.middleware])
        : [];

      route.options.middleware = [
        ...normalised,
        ...routeMiddleware,
      ];
    }

    this.routes.push(route);
  }

  public addRoutes(routes: Route[]) {
    routes.forEach((route) => this.addRoute(route));
  }
}
