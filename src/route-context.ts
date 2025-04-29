import { Context } from "jsr:@raptor/framework@0.7.2";
import type { Params } from "./interfaces/params.ts";

/**
 * An extension of the base context object.
 */
export default class RouteContext extends Context {
  /**
   * The current route parameters.
   */
  params: Params;

  /**
   * Initialise the route context.
   *
   * @param request The current HTTP request.
   * @param response The current HTTP response.
   */
  constructor(request: Request, response: Response) {
    super(request, response);

    this.params = {};
  }
}
