import { useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom"
import { invoke } from '@tauri-apps/api/core';
import { Asset, AssetFile } from "../../types";
import EditFileDialog from "./EditFileDialog";
import EditFileForm from "./EditFileForm";
import { AssetFileListItem } from "./AssetFileListItem";

export default function AssetRoute() {
  const { asset } = useLoaderData() as { asset: Asset };
  const [editFileDialogActive, setEditFileDialogActive] = useState(false);
  const [files, setFiles] = useState<AssetFile[]>([]);
  const [loadFileError, setLoadFileError] = useState(false);
  const [fileToEdit, setFileToEdit] = useState<null | AssetFile>(null)

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
    setEditFileDialogActive(true);
  }

  const handleEditFileComplete = (newFile: AssetFile) => {
    setEditFileDialogActive(false);
    // Insert or replace the updated file to the top of the list
    const newFiles = files.filter(file => file.uuid != newFile.uuid);
    newFiles.unshift(newFile);
    setFiles(newFiles);
  }

  const handleEditFileClick = (file: AssetFile) => {
    setFileToEdit(file);
    setEditFileDialogActive(true);
  }

  return <div className="m-4">
    <h1 className="text-xl font-bold mb-4">{ asset.name }</h1>
    <div className="flex border-b border-gray-200 items-end pb-2">
      <h2 className="text-lg">Files</h2>  
      <button className="bg-gray-200 rounded-md px-2 py-1 ml-auto" onClick={handleAddFileClick}>Add File</button>
      <EditFileDialog file={fileToEdit} isOpen={editFileDialogActive} onClose={() => setEditFileDialogActive(false)}>
        <EditFileForm file={fileToEdit} assetUuid={asset.uuid} onComplete={handleEditFileComplete} />
      </EditFileDialog>
    </div>
    <div>
      { loadFileError && <div className="text-red-800">Error loading files</div>}
      {files && <div>
        {files.map(file => <AssetFileListItem key={file.uuid} asset={asset} file={file} onEditClick={() => handleEditFileClick(file)} />)}
      </div>}
    </div>
  </div>
}