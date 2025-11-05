/**
 * Custom hook for sortable table functionality
 */
import { useState } from 'react'
import type { SortDirection } from '../types'

interface UseSortableConfig<T> {
  data: T[]
  getValue: (item: T, key: string) => number
}

export function useSortable<T>({ data, getValue }: UseSortableConfig<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string
    direction: SortDirection
  } | null>(null)

  const handleSort = (key: string) => {
    let direction: SortDirection = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = getValue(a, sortConfig.key)
    const bValue = getValue(b, sortConfig.key)

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  return {
    sortedData,
    sortConfig,
    handleSort,
  }
}
