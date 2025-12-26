import type { Params } from "./interfaces/params.ts";

/**
 * Type shim for @raptor/framework.
 * This allows module augmentation to work during JSR publish.
 */

declare module "@raptor/framework" {
  export interface Context {
    request: Request;
    response: Response;
    params: Params;
  }

  export class NotFound extends Error {
    constructor(message?: string);
  }

  export class Kernel {
    constructor();
    add(handler: (context: Context) => unknown): void;
    respond(request: Request): Promise<Response>;
  }
}
