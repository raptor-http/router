import type Route from "./route.ts";
import type { TreeNode } from "./interfaces/tree-node.ts";
import type { TreeMatchResult } from "./interfaces/tree-match-result.ts";

export default class Tree {
  private root: TreeNode = {
    pathname: "",
    children: [],
    isWildcard: false,
  };

  /**
   * Add a route to the tree.
   *
   * @param route The route to add to the tree.
   */
  public add(route: Route) {
    let node = this.root;

    const segments = route.options.pathname.split('/').filter(s => s);

    for (const segment of segments) {
      let child = node.children.find((c) => {
        if (c.pathname === segment) {
          return true;
        }

        if (segment.startsWith(':') && c.paramName) {
          return true;
        }

        return false;
      });

      if (!child) {
        child = {
          pathname: segment,
          children: [],
          isWildcard: segment === '*',
          paramName: segment.startsWith(':') ? segment.slice(1) : undefined
        };

        node.children.push(child);
      }

      node = child;
    }

    node.handler = route.options.handler;
    node.middleware = route.options.middleware;
  }

  /**
   * Match a tree node by path.
   *
   * @param path The path to match against tree nodes.
   * @returns 
   */
  public match(path: string): TreeMatchResult | null {
    let node = this.root;

    const segments = path.split('/').filter((s) => s);

    const params: Record<string, string> = {};

    for (const segment of segments) {
      const child = node.children.find((c) => {
        if (c.pathname === segment) {
          return true;
        }

        if (c.paramName) {
          params[c.paramName] = segment;

          return true;
        }

        return false;
      });

      if (!child) {
        const wildcard = node.children.find((c) => c.isWildcard);

        if (!wildcard?.handler) {
          return null;
        }

        return wildcard ? { handler: wildcard.handler, params } : null;
      }

      node = child;
    }

    if (node.handler) {
      return {
        handler: node.handler,
        middleware: node.middleware,
        params,
      };
    }

    return null;
  }
}
