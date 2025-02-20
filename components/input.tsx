import { InputHTMLAttributes } from "react";
interface InputProps {
  name: string;
  errors?: string[];
}
export default function Input({
  name,
  errors = [],
  ...rest
}: InputProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-4">
      <input
        name={name}
        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-neutral-700 placeholder-neutral-500 text-neutral-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm bg-neutral-700 mb-1"
        {...rest}
      />
      {errors.map((error, index) => (
        <span key={index} className="text-red-500 font-medium text-sm block">
          {error}
        </span>
      ))}
    </div>
  );
}
