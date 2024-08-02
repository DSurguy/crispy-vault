import { useMatches } from "react-router-dom";
import { twMerge } from "tailwind-merge";

type Handle = {
  crumb?: (data: any) => React.ReactNode | React.ReactNode[]
} | undefined;

type BreadcrumbsProps = {
  className?: string;
}

const defaultClassName = "flex px-2"

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const mergedClassName = twMerge(defaultClassName, className);
  let matches = useMatches();
  let crumbs = matches
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean((match.handle as Handle)?.crumb))
    // now map them into an array of elements, passing the loader
    // data to each one
    .map((match) => ({
      id: match.id,
      content: (match.handle as Handle)!.crumb!(match.data)
    }));

  return (
    <nav className={mergedClassName}>
      {crumbs.map((crumb, index) => {
        const divider = <div className="m-1">/</div>
        return <div key={index} className="flex items-center mr-2">{crumb.content}{index < crumbs.length-1 ? divider : null}</div>
      })}
    </nav>
  );
}
