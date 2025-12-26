import type { Params } from "@raptor/router";

declare module "@raptor/framework" {
  interface Context {
    params: Params;
  }
}

export {};
