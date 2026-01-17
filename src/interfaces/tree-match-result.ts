import type { Middleware } from "@raptor/framework";
import type { RouteHandler } from "../interfaces/route-handler.ts";

/**
 * An individual tree match result.
 */
export type TreeMatchResult = {
  handler: RouteHandler;
  params: Record<string, string>;
  middleware?: Middleware | Middleware[];
};
