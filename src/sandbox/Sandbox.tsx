import AssetTree from "./AssetTree/AssetTree";

export default function Sandbox() {
  return <div className="p-4">
    <h1 className="text-xl font-bold">Sandbox</h1>
    <AssetTree className="border border-gray-200 w-[400px] h-[720px]"/>
  </div>
}