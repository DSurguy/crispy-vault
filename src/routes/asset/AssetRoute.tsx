import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom"
import { invoke } from '@tauri-apps/api/core';
import { Asset, AssetFile } from "../../types";
import AddFileDialog from "./AddFileDialog";
import AddFileForm from "./AddFileForm";
import { AssetFileListItem } from "./AssetFileListItem";

export default function AssetRoute() {
  const { asset } = useLoaderData() as { asset: Asset };
  const [addFileDialogActive, setAddFileDialogActive] = useState(false);
  const [files, setFiles] = useState<AssetFile[]>([]);
  const [loadFileError, setLoadFileError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setFiles(await invoke("list_asset_files", {
          assetUuid: asset.uuid,
          page: 0
        }) as AssetFile[])
      } catch (e) {
        console.error(e);
        setLoadFileError(true);
      }
    })()
  }, [])

  const handleAddFileClick = () => {
    setAddFileDialogActive(true);
  }

  const handleAddFileDialogClose = () => {
    // TODO: Add file to list
    setAddFileDialogActive(false);
  }

  return <div className="m-4">
    <h1 className="text-xl font-bold mb-4">{ asset.name }</h1>
    <div className="flex border-b border-gray-200 items-end pb-2">
      <h2 className="text-lg">Files</h2>  
      <button className="bg-gray-200 rounded-md px-2 py-1 ml-auto" onClick={handleAddFileClick}>Add File</button>
      <AddFileDialog isOpen={addFileDialogActive} onClose={handleAddFileDialogClose}>
        <AddFileForm assetUuid={asset.uuid} onComplete={handleAddFileDialogClose} />
      </AddFileDialog>
    </div>
    <div>
      { loadFileError && <div className="text-red-800">Error loading files</div>}
      {files && <div>
        {files.map(file => <AssetFileListItem key={file.uuid} asset={asset} file={file} />)}
      </div>}
    </div>
  </div>
}