interface RawTreeItem {
  uuid: string;
  name: string;
  parent?: string;
  isAsset?: boolean;
}

/*
/first
  /child
    Test Asset 1
/second
/third
  /child
    Test Asset 5
  Test Asset 2
*/

const dirs: RawTreeItem[] = [{
  uuid: 'ca0a7b18-8681-402a-9118-61a47aac1b44',
  name: 'first',
  isAsset: false
}, {
  uuid: '549146a0-81aa-4a35-9a6c-aee214ea3fbb',
  name: 'second',
  isAsset: false
}, {
  uuid: 'dc5f3b34-d2f1-4d21-a798-3139fb4c987e',
  name: 'third',
  isAsset: false
}, {
  uuid: 'fa41c34d-9873-43c9-80cd-371c6f70a612',
  name: 'child',
  parent: 'ca0a7b18-8681-402a-9118-61a47aac1b44',
  isAsset: false
}, {
  uuid: 'f25a639e-7198-464f-91f6-8aa9e2fa3642',
  name: 'child',
  parent: 'dc5f3b34-d2f1-4d21-a798-3139fb4c987e',
  isAsset: false
}]

const assets: RawTreeItem[] = [{
  uuid: 'e581e290-7b4e-40e1-96c8-5c58586dd581',
  name: 'Test Asset 1',
  parent: 'fa41c34d-9873-43c9-80cd-371c6f70a612',
  isAsset: true
}, {
  uuid: '3a6d56f1-874e-4a64-8f64-c5a54dd69b9e',
  name: 'Test Asset 2',
  parent: 'dc5f3b34-d2f1-4d21-a798-3139fb4c987e',
  isAsset: true
}, {
  uuid: '90d68b47-7bad-4652-9d32-ef5a47a01683',
  name: 'Test Asset 3',
  parent: 'ca0a7b18-8681-402a-9118-61a47aac1b44',
  isAsset: true
}, {
  uuid: '87dbb66c-cedb-4b02-b8da-f70bec827647',
  name: 'Test Asset 4',
  parent: 'ca0a7b18-8681-402a-9118-61a47aac1b44',
  isAsset: true
}, {
  uuid: 'afb45df0-3087-49f4-b746-4e2f73d60c9a',
  name: 'Test Asset 5',
  parent: 'f25a639e-7198-464f-91f6-8aa9e2fa3642',
  isAsset: true
}]

// Only sort based on isAsset and name, assumes same parent
const sortTreeItems = (a: RawTreeItem, b: RawTreeItem): -1 | 0 | 1 => {
  if( !a.isAsset && b.isAsset ) return -1;
  if( a.isAsset && !b.isAsset ) return 1;

  if( a.name < b.name ) return -1;
  if( a.name > b.name ) return 1;
  return 0;
}

const rawItems = [...dirs, ...assets];

// Create lookup tables
const itemMap = new Map<string, RawTreeItem>();
const itemChildren = new Map<string, string[]>();
rawItems.forEach(item => {
  itemMap.set(item.uuid, item);
  const parent = item.parent || '';
  if( !itemChildren.has(parent) ) itemChildren.set(parent, []);
  itemChildren.set(parent, itemChildren.get(parent)!.concat([item.uuid]))
})

//sort each child array
itemChildren.forEach((children, key) => {
  itemChildren.set(
    key, 
    children
      .map(id => itemMap.get(id)!)
      .sort(sortTreeItems)
      .map(v => v.uuid)
  )
})

console.log(itemMap, itemChildren);

// perform DFS and construct tree list
// Assumes children are correctly sorted
let list: [id: string, depth: number][] = []
let stack: [id: string, depth: number][] = [];
let ref: string | undefined = ''
let depth = -1;
while(ref !== undefined) {
  if( ref !== '' ) list.push([ref, depth]);
  const children = itemChildren.get(ref)
  if( children ) {
    children.reverse().forEach(child => stack.push([child, depth + 1])) // javascript doesn't have queues
  }
  const next = stack.pop();
  if( next ) {
    ref = next[0];
    depth = next[1];
  }
  else break;
}

export interface TreeItem extends RawTreeItem {
  depth: number;
  hidden: boolean;
}

export const data = list.map(([id, depth]) => ({
  ...itemMap.get(id)!,
  depth,
  hidden: depth === 0 ? false : true
})) as TreeItem[];