import { twMerge } from 'tailwind-merge';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const defaultClassName = "border rounded-md p-2";

export default function TextInput({ className, type, ...rest }: TextInputProps) {
  const finalClassName = twMerge(defaultClassName, className)
  return <input className={finalClassName} type="text" {...rest} />
}