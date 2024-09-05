import { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { data, TreeItem } from './data';
import { IconFolder } from "@tabler/icons-react";

const Spacer = () => <div className="block w-4 h-full"></div>

interface TreeProps {
  item: TreeItem;
}

interface TreeFolderProps extends TreeProps {}

const TreeFolder = ({ item }: TreeFolderProps) => {
  const spaces = useMemo(() => {
    return new Array(item.depth).fill(0).map((_, index) => <Spacer key={index} />)
  }, [item.depth])
  
  return <div className="flex items-center">
    <div className="flex">{spaces}</div>
    <IconFolder size={20} className="mr-1" />
    <div>{item.name}</div>
  </div>
}

interface TreeAssetProps extends TreeProps {}

const TreeAsset = ({ item }: TreeAssetProps) => {
  const spaces = useMemo(() => {
    return new Array(item.depth).fill(0).map((_, index) => <Spacer key={index} />)
  }, [item.depth])

  return <div className="flex">
    <div className="flex">{spaces}</div>
    <div>{item.name}</div>
  </div>
}

type AssetTreeProps = {
  className?: string;
}

export default function AssetTree({ className }: AssetTreeProps) {
  const [items, setItems] = useState<TreeItem[]>([]);
  const mergedClassName = twMerge("p-2", className);

  useEffect(() => {
    setItems(data);
    console.log(data);
  }, [])

  return <div className={mergedClassName}>
    <div className="overflow-auto h-full w-full">
      {items.map(item => {
        if (item.isAsset) {
          return <TreeAsset key={item.uuid} item={item} />
        }
        return <TreeFolder key={item.uuid} item={item} />
      })}
    </div>
  </div>
}