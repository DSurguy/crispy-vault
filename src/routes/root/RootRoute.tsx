import { Outlet } from "react-router-dom";
import AppBar from "./AppBar";
import { Breadcrumbs } from "../../components/Breadcrumbs";

export default function RootRoute() {
  return <div className="flex flex-col h-full w-full">
    <AppBar className="grow-0" basis="basis-12" />
    <Breadcrumbs className="basis-8" />
    <div className="grow bg-gray-100">
      <Outlet />
    </div>
  </div>
}