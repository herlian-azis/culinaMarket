import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'brand'
}

const Badge = ({ className = "", variant = "default", ...props }: BadgeProps) => {
    const variants = {
        default: "border-transparent bg-gray-100 text-gray-800",
        secondary: "border-transparent bg-blue-100 text-blue-800",
        outline: "text-gray-800 border-gray-200",
        success: "border-transparent bg-green-100 text-green-800",
        warning: "border-transparent bg-yellow-100 text-yellow-800",
        error: "border-transparent bg-red-100 text-red-800",
        brand: "border-transparent bg-emerald-100 text-emerald-800",
    }

    return (
        <div
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${variants[variant]} ${className}`}
            {...props}
        />
    )
}

export { Badge }
