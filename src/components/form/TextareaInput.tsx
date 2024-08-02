import { Textarea } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

interface TextareaInputProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

const defaultClassName = "border rounded-md p-1";

export default function TextareaInput({ className, type, ...rest }: TextareaInputProps) {
  const finalClassName = twMerge(defaultClassName, className)
  return <Textarea className={finalClassName} {...rest} />
}