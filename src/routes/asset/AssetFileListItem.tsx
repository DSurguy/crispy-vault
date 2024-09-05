import { save } from "@tauri-apps/plugin-dialog";
import { copyFile } from "@tauri-apps/plugin-fs";
import { IconDownload, IconPencil } from "@tabler/icons-react";
import { Asset, AssetFile } from "../../types";
import { BaseDirectory, downloadDir } from "@tauri-apps/api/path";
import { extensionToColor } from "../../utils/stringToColor";

type AssetFileListItemProps = {
  asset: Asset;
  file: AssetFile;
  onEditClick: () => void;
}

// const toSnakeCase = (source: string) => source.toLowerCase().replace(/\s+/g, '_')
const toKebabCase = (source: string) => source.toLowerCase().replace(/\s+/g, '-')

export function AssetFileListItem({ asset, file, onEditClick }: AssetFileListItemProps) {
  const extensionBgColor = extensionToColor(file.extension, 100, 85)
  const extensionColor = extensionToColor(file.extension, 80, 15)

  const handleDownloadFileClick = async () => {
    const filename = `${toKebabCase(asset.name).substring(0,12)}_${toKebabCase(file.name).substring(0,12)}.${file.extension}`;
    const path = await save({
      defaultPath: await downloadDir() + `/${filename}`
    });
    if( !path ) return;
    await copyFile(`assets/${asset.uuid}/${file.uuid}.${file.extension}`, path, {
      fromPathBaseDir: BaseDirectory.AppLocalData
    });
  }

  return <div key={file.uuid} className="flex border-b border-gray-200 p-1 items-center">
    <h4 className="mr-2">{file.name}</h4>
    <div className="flex rounded-md px-1 items-center" style={{ backgroundColor: extensionBgColor }}>
      <div className="font-bold font-mono text-sm" style={{ color: extensionColor }}>{file.extension}</div>
    </div>
    <div className="ml-auto items-center h-full">
      <button className="mx-2" onClick={handleDownloadFileClick}><IconDownload /></button>
      <button className="mx-2" onClick={onEditClick}><IconPencil /></button>  
    </div>
  </div>
}