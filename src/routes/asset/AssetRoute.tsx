import { useLoaderData } from "react-router-dom"
import { Asset } from "../../types";
import { useEffect, useState } from "react";
import AddFileDialog from "./AddFileDialog";
import AddFileForm from "./AddFileForm";
import { invoke } from "@tauri-apps/api";

type AssetFile = {
  uuid: string;
  name: string;
  description: string;
}

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
    setAddFileDialogActive(false);
  }

  return <div className="m-4">
    <h1 className="text-xl font-bold mb-4">{ asset.name }</h1>
    <div className="flex border-b border-gray-200 items-end pb-2">
      <h2>Files</h2>
      <button className="bg-gray-200 rounded-md px-2 py-1 ml-auto" onClick={handleAddFileClick}>Add File</button>
      <AddFileDialog isOpen={addFileDialogActive} onClose={handleAddFileDialogClose}>
        <AddFileForm assetUuid={asset.uuid} onComplete={handleAddFileDialogClose} />
      </AddFileDialog>
    </div>
    <div>
      { loadFileError && <div className="text-red-800">Asplode</div>}
      {files && <div>
        {files.map(file => (<div key={file.uuid}>
          <h4>{file.name}</h4>
          <p>{file.description}</p>
        </div>))}
      </div>}
    </div>
  </div>
}