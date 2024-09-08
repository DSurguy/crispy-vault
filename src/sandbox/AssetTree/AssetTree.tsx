import { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { data, TreeItem } from './data';
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react";

const Spacer = () => <div className="block w-4 h-full"></div>

interface TreeProps {
  item: TreeItem;
}

interface TreeFolderProps extends TreeProps {
  onClick: () => void;
}

const TreeFolder = ({ item, onClick }: TreeFolderProps) => {
  const spaces = useMemo(() => {
    return new Array(item.depth).fill(0).map((_, index) => <Spacer key={index} />)
  }, [item.depth])
  
  return <div className="flex items-center hover:bg-gray-100 cursor-pointer" onClick={onClick}>
    <div className="flex">{spaces}</div>
    { item.expanded ? <IconChevronDown size={20} className="mr-1" /> : <IconChevronRight size={20} className="mr-1" /> }
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
  const filteredItems = items.filter(item => !item.hidden);
  const mergedClassName = twMerge("p-2", className);

  useEffect(() => {
    setItems(data);
  }, [])

  const handleFolderClick = (item: TreeItem) => {
    const itemIndex = items.findIndex(v => v === item);
    const nextItems = [...items];
    const expanded = !item.expanded;
    nextItems[itemIndex].expanded = expanded;
    let nextIndex = itemIndex + 1;
    let hiddenDepths = new Set<number>(); // When expanding, track the folders that are still collapsed
    // TODO: Fix
    while(nextItems[nextIndex] && nextItems[nextIndex].depth > item.depth) {
      const nextItem = nextItems[nextIndex];
      console.log(expanded, nextItem);
      if( !expanded ) {
        // Hide all children at any depth
        nextItem.hidden = true;
      }
      else {
        // If this is a child folder that is still not expanded, mark the child depth as hidden
        if( !nextItem.isAsset && !nextItem.expanded ) {
          hiddenDepths.add(nextItem.depth+1);
        }
        nextItem.hidden = hiddenDepths.has(nextItem.depth);
      }
      nextIndex++;
    }
    setItems(nextItems);
  }

  return <div className={mergedClassName}>
    <div className="overflow-auto h-full w-full">
      {filteredItems.map((item) => {
        if (item.isAsset) {
          return <TreeAsset key={item.uuid} item={item} />
        }
        return <TreeFolder key={item.uuid} item={item} onClick={() => handleFolderClick(item)} />
      })}
    </div>
  </div>
}