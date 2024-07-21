import { useEffect, useState } from 'react';
import { open } from '@tauri-apps/api/dialog';
import { open as shellOpen } from '@tauri-apps/api/shell';
import { copyFile } from '@tauri-apps/api/fs';
import { appDataDir } from '@tauri-apps/api/path';

export default function TestRoute() {
  const [dataDir, setDataDir] = useState('')

  useEffect(() => {
    (async () => {
      try {
        setDataDir(await appDataDir())
      } catch (e) {
        console.error(e);
      }
    })()
  }, [])

  const handleGetFileClick = async () => {
    try {
      const selected = await open({
        multiple: false,
      }) as string;

      if ( selected ) {
        await copyFile(selected, dataDir + '/' + selected.split('/').slice(-1)[0])
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleOpenDataDirClick = async () => {
    try {
      await shellOpen(dataDir);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="p-4">
      <div className="mb-2">
        <span>Data Directory: {dataDir || 'Unknown'}</span>
        { dataDir && <button className='ml-4 underline' onClick={handleOpenDataDirClick}>Open data dir</button>}
      </div>
      { dataDir && <button className="border-gray-800 border rounded-md p-2" onClick={handleGetFileClick}>Copy a file to data dir</button>}
    </div>
  );
}