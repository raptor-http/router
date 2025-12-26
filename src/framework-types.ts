// Shim, used only for type-check during publishing to JSR.

export interface Context {
  request: Request;
  params?: Record<string, string>;
}

export declare class NotFound extends Error {}
