import HttpMethod from "./enums/http-method.ts";
import type { Params } from "./interfaces/params.ts";
import type { RouteOptions } from "./interfaces/route-options.ts";

/**
 * The route definition.
 */
export default class Route {
  /**
   * A configurable option set for a route.
   */
  options: RouteOptions;

  /**
   * Stored compiled pattern for router.
   */
  pattern: URLPattern;

  /**
   * Stored compiled param regex.
   */
  paramRegex?: RegExp;

  /**
   * Stored compiled param names.
   */
  paramNames?: string[];

  /**
   * Initialise a route object.
   *
   * @constructor
   * @param options The options for the route.
   */
  constructor(options: RouteOptions) {
    this.options = {
      ...{
        method: HttpMethod.GET,
      },
      ...options,
    };

    this.pattern = new URLPattern({
      pathname: options.pathname,
    });

    const hasParams = options.pathname.includes(":");
    const hasWildcard = options.pathname.includes("*");

    if (hasParams || hasWildcard) {
      const segments: string[] = [];

      const regexPattern = options.pathname
        .replace(/\/:([^\/]+)/g, (_match, name) => {
          segments.push(name);
          return "/([^/]+)";
        })
        .replace(/\/\*/g, () => {
          segments.push("*");
          return "(/.*)?";
        });

      this.paramRegex = new RegExp(`^${regexPattern}$`);
      this.paramNames = segments;
    }
  }

  /**
   * Extract parameters from a URL.
   *
   * @param url The URL to extract parameters from.
   * @returns The extracted parameters.
   */
  public extractParams(url: string): Params {
    if (!this.paramRegex || !this.paramNames || this.paramNames.length === 0) {
      return {};
    }

    const urlObj = new URL(url);

    const match = urlObj.pathname.match(this.paramRegex);

    if (!match) return {};

    const params: Params = {};

    this.paramNames.forEach((name, index) => {
      const value = match[index + 1];

      if (name === "*") {
        params["*"] = value?.replace(/^\//, "") || "";

        return;
      }

      params[name] = value;
    });

    return params;
  }
}
