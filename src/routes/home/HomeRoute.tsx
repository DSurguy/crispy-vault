import { getRouteApi, Link } from "@tanstack/react-router";

const routeApi = getRouteApi('/')

export default function HomeRoute() {
  const { uuid } = routeApi.useSearch() as { uuid?: string };
  return <div className="p-4">
    <div><Link to="/add-asset">Add Asset</Link></div>
    { uuid && <div className="mt-2">You created an asset with uuid <code>{uuid}</code></div> }
  </div>
}