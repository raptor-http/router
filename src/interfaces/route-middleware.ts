import type { Context } from "@raptor/framework";

/**
 * Middleware function that processes context before the handler.
 */
export type RouteMiddleware = (
  context: Context,
  next: CallableFunction,
) => void | Promise<void>;
