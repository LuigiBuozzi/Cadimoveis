import { formatThousands, priceDigits } from '@/lib/price';

type PriceInputProps = {
    id: string;
    // The field submitted with the form. Defaults to the id.
    name?: string;
    label: string;
    // The price digits, without formatting (e.g. "1500000").
    value: string;
    onChange: (value: string) => void;
    inputClassName: string;
    placeholder?: string;
    required?: boolean;
    invalid?: boolean;
    describedBy?: string;
};

/**
 * A price field in reais that shows thousand separators while typing and
 * submits only the digits.
 */
export default function PriceInput({
    id,
    name = id,
    label,
    value,
    onChange,
    inputClassName,
    placeholder,
    required,
    invalid,
    describedBy,
}: PriceInputProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={id} className="text-sm font-medium">
                {label}
            </label>
            <div className="relative">
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-[#706f6c] dark:text-[#A1A09A]"
                >
                    R$
                </span>
                <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder={placeholder}
                    required={required}
                    value={formatThousands(value)}
                    onChange={(event) =>
                        onChange(priceDigits(event.target.value))
                    }
                    aria-invalid={invalid || undefined}
                    aria-describedby={describedBy}
                    className={`${inputClassName} pl-10 tabular-nums aria-invalid:border-[#f53003] dark:aria-invalid:border-[#FF4433]`}
                />
            </div>
            {value && <input type="hidden" name={name} value={value} />}
        </div>
    );
}
