import { twMerge } from 'tailwind-merge';

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  className?: string;
  onChange: (file: File | null) => void;
}

const defaultClassName = "border rounded-md p-2";

export default function FileInput({ className, type, onChange, ...rest }: FileInputProps) {
  const finalClassName = twMerge(defaultClassName, className)
  const internalOnChange: React.ChangeEventHandler<HTMLInputElement> = e => onChange(e.target.files?.[0] || null)
  return <input className={finalClassName} type="file" onChange={internalOnChange} {...rest} />
}