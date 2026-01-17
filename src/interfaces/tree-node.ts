import type { Middleware } from "@raptor/framework";
import type { RouteHandler } from "./route-handler.ts";

export type TreeNode = {
  pathname: string;
  children: TreeNode[];
  isWildcard: boolean;
  paramName?: string;
  handler?: RouteHandler;
  middleware?: Middleware | Middleware[];
};
