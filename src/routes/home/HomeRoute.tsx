import { Link } from "react-router-dom";
import { useCleanSearchParams } from "../../utils/route";
import { homeSearchSchema } from "./route";

export default function HomeRoute() {
  const [{ searchParams, searchError }] = useCleanSearchParams(homeSearchSchema);
  
  let uuid;
  if( !searchError && searchParams ){
    uuid = searchParams.uuid;
  }

  return <div className="p-4">
    <div><Link to="/add-asset">Add Asset</Link></div>
    { uuid && <div className="mt-2">You created an asset with uuid <code>{uuid}</code></div> }
  </div>
}