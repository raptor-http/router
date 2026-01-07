import type HttpMethod from "../enums/http-method.ts";
import type { RouteHandler } from "./route-handler.ts";
import type { RouteMiddleware } from "./route-middleware.ts";

/**
 * The route options definition.
 */
export interface RouteOptions {
  /**
   * The name of the route.
   */
  name?: string;

  /**
   * The assigned URL pattern for the route.
   */
  pathname: string;

  /**
   * The HTTP method allowed to the route.
   */
  method: HttpMethod | HttpMethod[];

  /**
   * Optional middleware for the route.
   */
  middleware?: RouteMiddleware | RouteMiddleware[];

  /**
   * The handler function when processing the route.
   */
  handler: RouteHandler;
}
