// Shim, used only for type-check during publishing to JSR.

import type { Params } from "./interfaces/params.ts";

export interface Context {
  request: Request;
  params: Params;
}

export declare class NotFound extends Error {}
