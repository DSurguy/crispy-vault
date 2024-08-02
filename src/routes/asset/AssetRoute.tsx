import { useLoaderData } from "react-router-dom"
import { Asset } from "../../types";
import { useState } from "react";
import AddFileDialog from "./AddFileDialog";
import AddFileForm from "./AddFileForm";

export default function AssetRoute() {
  const { asset } = useLoaderData() as { asset: Asset };
  const [addFileDialogActive, setAddFileDialogActive] = useState(false);

  const handleAddFileClick = () => {
    setAddFileDialogActive(true);
  }

  const handleAddFileDialogClose = () => {
    setAddFileDialogActive(false);
  }

  return <div className="m-4">
    <h1 className="text-lg">{ asset.name }</h1>
    <div className="flex">
      <h2>Files</h2>
      <button className="bg-gray-200 rounded-md px-2 py-1 ml-auto" onClick={handleAddFileClick}>Add File</button>
      <AddFileDialog isOpen={addFileDialogActive} onClose={handleAddFileDialogClose}>
        <AddFileForm assetUuid={asset.uuid} onComplete={handleAddFileDialogClose} />
      </AddFileDialog>
    </div>
  </div>
}