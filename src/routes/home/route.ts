import { AnyRoute, createRoute } from "@tanstack/react-router";
import { z } from 'zod';
import HomeRoute from "./HomeRoute";

const homeSearchSchema = z.object({
  uuid: z.string().catch(''),
})

// FIXME: How the hell do you get the schema types to where you `useSearch`??? - modern router libraries SUCK
type HomeSearch = z.infer<typeof homeSearchSchema>

const homeRouteFactory = (parentRoute: AnyRoute) => createRoute({
  getParentRoute: () => parentRoute,
  path: '/',
  component: HomeRoute,
  validateSearch: search => homeSearchSchema.parse(search)
})

export default homeRouteFactory;