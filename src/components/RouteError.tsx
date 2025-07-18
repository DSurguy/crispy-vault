import { IconFaceIdError } from "@tabler/icons-react";
import { useRouteError } from "react-router-dom";

export default function RouteError() {
  const error = useRouteError() as Error;
  return <div className="h-full v-full flex justify-center items-center flex-col">
    <div><IconFaceIdError className="w-24 h-24 stroke-red-600" /></div>
    <div className="text-red-600">{error.message}</div>
  </div>
}