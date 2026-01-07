import type { Context } from "@raptor/framework";

/**
 * Handler function that processes a request and returns a response.
 */
export type RouteHandler = (context: Context) => unknown | Promise<unknown>;
