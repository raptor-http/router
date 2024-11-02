import type { Params } from "./params.ts";

import type { Request, Response } from "jsr:@raptor/framework@0.3.0";

/**
 * The HTTP context definition.
 */
export interface Context {
  /**
   * The current HTTP request.
   */
  request: Request;

  /**
   * The current HTTP response.
   */
  response: Response;

  /**
   * The current HTTP route parameters.
   */
  params: Params;
}
