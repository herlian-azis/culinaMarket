import * as React from "react"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    leftIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", type, label, error, leftIcon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={`
              flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 
              placeholder:text-gray-400 
              focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500
              disabled:cursor-not-allowed disabled:opacity-50
              transition-all
              ${leftIcon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-200 focus:border-red-500' : ''}
              ${className}
            `}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1 text-xs text-red-500">{error}</p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
