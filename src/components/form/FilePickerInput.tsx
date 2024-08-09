import { open } from "@tauri-apps/plugin-dialog";
import { twMerge } from "tailwind-merge";

type FilePickerInputProps = {
  className?: string;
  onChange: (filePath: string | null) => void;
  value: string | null;
}

const defaultClassName = "border border-gray-200 rounded-md p-2";

export default function FilePickerInput({ className, onChange, value }: FilePickerInputProps) {
  const mergedClassName = twMerge(defaultClassName, className);
  const wrappableValue = value?.split('/').map((part, index, parts) => {
    return <span key={index}>{part}{index < parts.length -1 ? '/' : null}</span>
  })

  const handleChooseClick = async () => {
    try {
      const selected = await open({
        multiple: false,
      });

      if ( selected ) {
        onChange(selected.path);
      } else {
        onChange(null);
      }
    } catch (e) {
      console.error(e);
      onChange(null);
    }
  }

  return <div className={mergedClassName}>
    { wrappableValue && <div className="m-2 font-mono flex flex-wrap">{wrappableValue}</div> }
    <button type="button" aria-label="Choose File" className="bg-gray-200 px-2 py-1 rounded-md" onClick={handleChooseClick}>Choose File</button>
  </div>
}