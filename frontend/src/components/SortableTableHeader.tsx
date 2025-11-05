/**
 * Sortable Table Header Component
 */
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { SortDirection } from '../types'

interface SortableTableHeaderProps {
  label: string
  sortKey: string
  currentSort?: { key: string; direction: SortDirection } | null
  onSort: (key: string) => void
  className?: string
}

export default function SortableTableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  className = '',
}: SortableTableHeaderProps) {
  const isActive = currentSort?.key === sortKey
  const direction = isActive ? currentSort.direction : null

  return (
    <th
      className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100 ${className}`}
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center">
        {label}
        {direction === 'asc' && <ChevronUp className="h-4 w-4 ml-1" />}
        {direction === 'desc' && <ChevronDown className="h-4 w-4 ml-1" />}
      </div>
    </th>
  )
}
