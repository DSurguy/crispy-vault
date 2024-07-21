import { AnyRoute, createRoute } from "@tanstack/react-router";
import HomeRoute from "./HomeRoute";

const homeRouteFactory = (parentRoute: AnyRoute) => createRoute({
  getParentRoute: () => parentRoute,
  path: '/',
  component: HomeRoute
})

export default homeRouteFactory;