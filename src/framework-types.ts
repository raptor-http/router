import type { Params } from "./interfaces/params.ts";

/**
 * Type shim for @raptor/framework.
 * This allows module augmentation to work during JSR publish.
 */

export interface Context {
  request: Request;
  response: Response;
  params: Params;
}

export declare class NotFound extends Error {
  constructor(message?: string);
}

export declare class Kernel {
  constructor();
  add(handler: (context: Context) => unknown): void;
  respond(request: Request): Promise<Response>;
}
