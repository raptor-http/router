import type { Params } from "@raptor/router";

declare global {
  interface Request {
    params: Params;
  }
}

export {};
