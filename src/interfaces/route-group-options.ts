import type { Middleware } from "@raptor/framework";

/**
 * The route group options definition.
 */
export interface RouteGroupOptions {
  /**
   * A name prefix to use for the group's routes.
   */
  name: string;

  /**
   * A path prefix to use for the group's routes.
   */
  prefix: string;

  /**
   * Optional middleware for the group.
   */
  middleware?: Middleware | Middleware[];
}
