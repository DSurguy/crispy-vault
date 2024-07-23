import { twMerge } from "tailwind-merge";
import { TbMenu2 } from "react-icons/tb";

type AppBarProps = {
  className?: string;
  basis: string;
}

const defaultClassName = "flex items-center"
const defaultIconWrapperClassName = "flex h-full justify-center items-center p-1"

export default function AppBar({ className, basis = "basis-12" }: AppBarProps) {
  const mergedClassName = twMerge(defaultClassName, className, basis)
  const mergedIconWrapperClassName = twMerge(defaultIconWrapperClassName, basis);
  return <div className={mergedClassName}>
    <div className={mergedIconWrapperClassName}>
      <button className="p-2 rounded-md bg-gray-100">
        <TbMenu2 />
      </button>
    </div>
    <div className="flex grow h-full items-center">
      {/* TODO: design search component */}
      <input className="grow mr-4 rounded-md bg-gray-100 p-1 border border-gray-400" type="search" placeholder="Search for assets and samples by name or tag" />
    </div>
  </div>
}