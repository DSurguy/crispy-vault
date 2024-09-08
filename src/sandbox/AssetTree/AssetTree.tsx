import { useEffect, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { IconChevronDown, IconChevronRight, IconFolder } from "@tabler/icons-react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { data, TreeItem } from './data';

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

  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: item.uuid
  })
  const {attributes, isDragging, listeners, setNodeRef: setDraggableNodeRef} = useDraggable({
    id: item.uuid,
    data: {
      type: 'folder'
    }
  })

  const className = twMerge("flex items-center hover:bg-gray-100 cursor-pointer relative", isDragging && "opacity-30");
  const droppableClassName = twMerge("absolute inset-0", isOver && !isDragging && "border-2 border-teal-500")
  
  return <div ref={setDraggableNodeRef} className={className} onClick={onClick} {...listeners} {...attributes}>
    <div ref={setDroppableNodeRef} className={droppableClassName}></div>
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

  const {attributes, isDragging, listeners, setNodeRef} = useDraggable({
    id: item.uuid,
    data: {
      type: 'asset'
    }
  })
  
  const className = twMerge("flex", isDragging && "opacity-30")

  return <div ref={setNodeRef} className={className} {...listeners} {...attributes}>
    <div className="flex">{spaces}</div>
    <div>{item.name}</div>
  </div>
}

type AssetTreeProps = {
  className?: string;
}

export default function AssetTree({ className }: AssetTreeProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );
  const [items, setItems] = useState<TreeItem[]>([]);
  const [dragItem, setDragItem] = useState<null|TreeItem>(null);
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

  const handleDragStart = ({ active }: DragStartEvent) => {
    setDragItem(items.find(v => v.uuid === active.id) || null)
  }

  // TODO: Prompt for move? (setting???)
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDragItem(null)
    if( !over ) return;
    if( over.id === active.id ) return;
    try {
      const nextItems = [...items]
      const activeData = active.data.current as unknown as { type: string }; // TODO: this can probably explode
      const destinationIndex = items.findIndex(v => v.uuid === over.id);
      const destinationItem = items[destinationIndex];
      const sourceIndex = items.findIndex(v => v.uuid === active.id)
      const sourceItem = items[sourceIndex];

      if( sourceItem.parent === destinationItem.uuid) return;

      if( activeData.type === 'folder') {
        // grab the entire slice and move it
        let end = sourceIndex;
        for(let i=sourceIndex+1; i<items.length; i++) {
          if( items[i].depth <= sourceItem.depth ) {
            break;
          }
          end = i;
        }
        const slice = nextItems.splice(sourceIndex, end-sourceIndex+1)
        const depthDiff = sourceItem.depth - (destinationItem.depth + 1);
        slice.forEach(v => v.depth = v.depth - depthDiff);
        
        // Find out where this folder resides in the sorted folder list, then insert it there
        let insertIndex: null | number = null;
        for(let i=destinationIndex+1; i<items.length; i++) {
          const itemToCheck = items[i];
          
          if( itemToCheck.depth === destinationItem.depth + 1 ) {
            // this is a direct child
            if( itemToCheck.isAsset ) {
              // Not a folder. If we're still here, we need to insert before this item.
              insertIndex = i;
              break;
            }
          }
          else if( itemToCheck.depth > destinationItem.depth + 1) continue; // Not a direct child
          else break; // no more children

          if( sourceItem.name < itemToCheck.name ) {
            // This is a folder, and we're now in the sorted position, insert right before this item
            insertIndex = i;
            break;
          }
        }
        if (insertIndex === null ){
          // there were no children, insert after the destination item
          insertIndex = destinationIndex + 1;
        }
        nextItems.splice(insertIndex, 0, ...slice);
        setItems(nextItems);
      }
      else {
        // just move the one item
        nextItems.splice(sourceIndex, 1);
        // TODO
      }
    } catch (e) {
      console.error(e);
    }
  }

  return <div className={mergedClassName}>
    <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
      {/* TODO: Apply offset to put the overlay at the mouse */}
      <DragOverlay className="border border-dashed border-blue-400" dropAnimation={null}>
        { dragItem ? ( 
          <div className="flex justify-center items-center opacity-50">{!dragItem.isAsset && <IconFolder size={16} className="mr-1" />}{dragItem.name}</div>
        ) : null}
      </DragOverlay>
      <div className="overflow-auto h-full w-full">
        {filteredItems.map((item) => {
          if (item.isAsset) {
            return <TreeAsset key={item.uuid} item={item} />
          }
          return <TreeFolder key={item.uuid} item={item} onClick={() => handleFolderClick(item)} />
        })}
      </div>
    </DndContext>
  </div>
}

