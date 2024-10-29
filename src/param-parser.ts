import type { Params } from "./interfaces/params.ts";

/**
 * The parser for extracting route parameters.
 */
export default class ParamParser {
  /**
   * The current URL pattern.
   */
  public pattern: URLPattern;

  /**
   * The current HTTP request URL.
   */
  public url: string;

  /**
   * Initialise the param parser.
   *
   * @constructor
   * @param pattern The current URL pattern.
   * @param url The current HTTP request URL.
   */
  constructor(pattern: URLPattern, url: string) {
    this.pattern = pattern;
    this.url = url;
  }

  /**
   * Parse the current request and return paramters.
   *
   * @returns Returns a params object.
   */
  public parse(): Params {
    const segments: Array<string> = [];

    const regexPattern = this.pattern.pathname.replace(
      /\/:([^\/]+)/g,
      (_match, name) => {
        segments.push(name);

        return "/([^/]+)";
      },
    );

    const regex = new RegExp(`^${regexPattern}$`);

    const url = new URL(this.url);

    const match = url.pathname.match(regex);

    if (!match) return {};

    const params: Params = {};

    segments.forEach((name, index) => {
      const value = match[index + 1];
      params[name] = value;
    });

    return params;
  }
}
