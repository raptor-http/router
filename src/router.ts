import { ServiceProvider } from "@raptor/framework";
import { container, type DependencyContainer } from "npm:tsyringe@^4.8.0";

import RouteProcessor from "./route-processor.ts";

import type Route from "./route.ts";

export default class Router extends ServiceProvider {
  /**
   * The kernel container.
   */
  override container : DependencyContainer;

  /**
   * All loaded routes.
   */
  public routes: Route[];

  /**
   * Initialise a router object.
   *
   * @constructor
   */
  constructor() {
    super();

    this.routes = [];
    this.container = container;
  }

  /**
   * Add one or more routes to the router.
   *
   * @param routes One or many routes.
   * @returns void
   */
  public add(routes: Route | Route[]): void {
    if (Array.isArray(routes)) {
      this.addRoutes(routes);

      return;
    }

    this.addRoute(routes);
  }

  /**
   * Add a single route to the router.
   *
   * @param route A single route definition.
   */
  public addRoute(route: Route): void {
    this.routes = [
      ...this.routes,
      route,
    ];
  }

  /**
   * Add one or more routes to the router.
   *
   * @param routes One or more route definitions.
   */
  public addRoutes(routes: Route[]): void {
    this.routes = [...this.routes, ...routes];
  }

  /**
   * Register the middleware service for handling routes.
   *
   * @returns void
   */
  override register(): void {
    this.container.register("middleware", { useFactory: () => {
      return new RouteProcessor(this.routes)
    }})
  }
}
