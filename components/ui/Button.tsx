import * as React from "react"
import { Loader2 } from "lucide-react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className = "",
        variant = "primary",
        size = "md",
        isLoading = false,
        leftIcon,
        rightIcon,
        children,
        disabled,
        ...props
    }, ref) => {

        const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50"

        const variants = {
            primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
            secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
            outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
            ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-600",
            danger: "bg-red-50 text-red-600 hover:bg-red-100",
        }

        const sizes = {
            sm: "h-8 rounded-lg px-3 text-xs",
            md: "h-10 rounded-lg px-4 py-2 text-sm",
            lg: "h-11 rounded-lg px-8 text-base",
            icon: "h-10 w-10 rounded-lg",
        }

        const variantStyles = variants[variant]
        const sizeStyles = sizes[size]

        return (
            <button
                className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
                ref={ref}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
