import * as React from "react"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = "", noPadding = false, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${noPadding ? '' : 'p-6'} ${className}`}
                {...props}
            >
                {children}
            </div>
        )
    }
)
Card.displayName = "Card"

export { Card }
