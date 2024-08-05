import { open } from "@tauri-apps/api/dialog";
import { TbDownload, TbPencil } from "react-icons/tb";
import { Asset, AssetFile } from "../../types";
// import { copyFile } from "@tauri-apps/api/fs";

type AssetFileListItemProps = {
  asset: Asset;
  file: AssetFile;
}

// const toSnakeCase = (source: string) => source.toLowerCase().replace(/\s+/g, '_')
const toKebabCase = (source: string) => source.toLowerCase().replace(/\s+/g, '-')

export function AssetFileListItem({ asset, file }: AssetFileListItemProps) {
  const handleDownloadFileClick = async () => {
    const filename = `${toKebabCase(asset.name).substring(0,12)}_${toKebabCase(file.name).substring(0,12)}.${file.extension}`;
    const path = await open({
      directory: true,
      title: `Download ${filename}`
    });
    console.log(`${path}/${filename}`);
    // TODO: Handle overwrite
    // await copyFile(`$APPDATA/assets/${asset.uuid}/${file.uuid}.${file.extension}`, `${path}/${filename}`);
  }

  return <div key={file.uuid} className="flex border-b border-gray-200 p-1 items-center">
    <h4 className="mr-2">{file.name}</h4>
    <div className="flex bg-blue-200 rounded-md px-1 items-center">
      <div className="font-bold font-mono text-blue-900 text-sm">{file.extension}</div>
    </div>
    <div className="ml-auto items-center h-full">
      <button className="mx-2" onClick={handleDownloadFileClick}><TbDownload /></button>
      <button className="mx-2"><TbPencil /></button>  
    </div>
  </div>
}