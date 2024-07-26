import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCleanSearchParams } from "../../utils/route";
import { homeSearchSchema } from "./route";
import { invoke } from "@tauri-apps/api";

export default function HomeRoute() {
  const [{ searchParams, searchError }] = useCleanSearchParams(homeSearchSchema);
  const [assets, setAssets] = useState<{ uuid: string, name: string }[]>([]);
  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    (async () => {
      try {
        setAssets(await invoke("list_assets"))
        setError(null);
      } catch (e) {
        if( e instanceof Error )
          setError(e.message);
        else setError("Unknown error")
      }
    })()
  }, [])
  
  let uuid;
  if( !searchError && searchParams ){
    uuid = searchParams.uuid;
  }

  return <div className="p-4">
    { uuid && <div className="p-2 bg-green-200 text-green-800">You created an asset with uuid <code className="font-bold">{uuid}</code></div> }
    <Link to={'/list-assets'}>Asset List</Link>
  </div>
}