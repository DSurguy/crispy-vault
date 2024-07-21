import { AnyRoute, createRoute } from "@tanstack/react-router";
import AddAssetRoute from "./AddAssetRoute";

const addAssetRouteFactory = (parentRoute: AnyRoute) => createRoute({
  getParentRoute: () => parentRoute,
  path: '/add-asset',
  component: AddAssetRoute
})

export default addAssetRouteFactory;