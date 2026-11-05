import type { InputHTMLAttributes } from 'react';

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    name: string;
    error?: string;
};

export default function FormField({
    label,
    name,
    error,
    ...props
}: FormFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={name} className="text-sm font-medium">
                {label}
            </label>
            <input
                id={name}
                name={name}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${name}-error` : undefined}
                className="rounded-md border border-[#e3e3e0] bg-[#FDFDFC] px-3 py-2 text-sm outline-none focus:border-[#1b1b18] focus:ring-1 focus:ring-[#1b1b18] aria-invalid:border-[#f53003] dark:border-[#3E3E3A] dark:bg-[#0a0a0a] dark:focus:border-[#EDEDEC] dark:focus:ring-[#EDEDEC] dark:aria-invalid:border-[#FF4433]"
                {...props}
            />
            {error && (
                <p
                    id={`${name}-error`}
                    className="text-sm text-[#f53003] dark:text-[#FF4433]"
                >
                    {error}
                </p>
            )}
        </div>
    );
}
