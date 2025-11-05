/**
 * Info Box Component - Displays informational content
 */
import { ReactNode } from 'react'

interface InfoBoxProps {
  title?: string
  children: ReactNode
  variant?: 'blue' | 'yellow' | 'green' | 'red'
  className?: string
}

const variantStyles = {
  blue: 'bg-blue-50 border-blue-200 text-blue-900',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
  green: 'bg-green-50 border-green-200 text-green-900',
  red: 'bg-red-50 border-red-200 text-red-900',
}

export default function InfoBox({
  title,
  children,
  variant = 'blue',
  className = '',
}: InfoBoxProps) {
  return (
    <div className={`p-4 border rounded-lg ${variantStyles[variant]} ${className}`}>
      {title && (
        <h3 className="font-semibold mb-2">{title}</h3>
      )}
      <div className="text-sm">{children}</div>
    </div>
  )
}
