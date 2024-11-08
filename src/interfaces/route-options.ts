import type HttpMethod from "../enums/http-method.ts";

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
   * The handler function when processing the route.
   */
  handler: CallableFunction;
}
