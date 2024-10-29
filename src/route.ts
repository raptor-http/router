import type { RouteOptions } from "./interfaces/route-options.ts";

/**
 * The route definition.
 */
export default class Route {
  /**
   * A configurable option set for a route.
   */
  options: RouteOptions;

  /**
   * Initialise a route object.
   *
   * @constructor
   * @param options The options for the route.
   */
  constructor(options: RouteOptions) {
    this.options = {
      ...{
        method: "GET",
      },
      ...options,
    };
  }
}
