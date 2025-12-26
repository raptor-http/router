import type { Params } from "./interfaces/params.ts";

declare module "@raptor/framework" {
  interface Context {
    params: Params;
  }
}
