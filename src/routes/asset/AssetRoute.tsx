import { useLoaderData } from "react-router-dom"
import { Asset } from "../../types";

export default function AssetRoute() {
  const { asset } = useLoaderData() as { asset: Asset };
  return <div>{ asset.name }</div>
}