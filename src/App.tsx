import { createRootRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import homeRouteFactory from './routes/home/route';
import addAssetRouteFactory from './routes/add-asset/route';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})

const homeRoute = homeRouteFactory(rootRoute)
const addAssetRoute = addAssetRouteFactory(rootRoute)

const routeTree = rootRoute.addChildren([homeRoute, addAssetRoute])
const router = createRouter({ routeTree })

export default function App() {
  return <RouterProvider router={router} />;
}
