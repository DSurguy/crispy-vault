import { useLoaderData } from "react-router-dom"
import { Asset } from "../../types";

export default function AssetRoute() {
  const { asset } = useLoaderData() as { asset: Asset };
  return <div className="m-4">
    <h1 className="text-lg">{ asset.name }</h1>
  </div>
}