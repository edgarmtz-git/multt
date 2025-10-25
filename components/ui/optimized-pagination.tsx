'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface OptimizedPaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onLimitChange?: (limit: number) => void
  showLimitSelector?: boolean
  showPageInput?: boolean
  className?: string
}

export function OptimizedPagination({
  pagination,
  onPageChange,
  onLimitChange,
  showLimitSelector = true,
  showPageInput = true,
  className
}: OptimizedPaginationProps) {
  const [pageInput, setPageInput] = useState(pagination.page.toString())

  useEffect(() => {
    setPageInput(pagination.page.toString())
  }, [pagination.page])

  const handlePageInputChange = (value: string) => {
    setPageInput(value)
  }

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInput)
    if (page >= 1 && page <= pagination.totalPages) {
      onPageChange(page)
    } else {
      setPageInput(pagination.page.toString())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePageInputSubmit()
    }
  }

  const getVisiblePages = () => {
    const { page, totalPages } = pagination
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i)
    }

    if (page - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (page + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (pagination.totalPages <= 1) {
    return null
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Información de resultados */}
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>
          Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
        </span>
      </div>

      {/* Controles de paginación */}
      <div className="flex items-center space-x-2">
        {/* Selector de límite */}
        {showLimitSelector && onLimitChange && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => onLimitChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Navegación */}
        <div className="flex items-center space-x-1">
          {/* Primera página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!pagination.hasPrev}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          {/* Página anterior */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrev}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Números de página */}
          <div className="flex items-center space-x-1">
            {getVisiblePages().map((page, index) => (
              <div key={index}>
                {page === '...' ? (
                  <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={page === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Página siguiente */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Última página */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.totalPages)}
            disabled={!pagination.hasNext}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Input de página */}
        {showPageInput && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Ir a:</span>
            <Input
              type="number"
              value={pageInput}
              onChange={(e) => handlePageInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handlePageInputSubmit}
              className="w-16 h-8 text-center"
              min="1"
              max={pagination.totalPages}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Hook para paginación optimizada
 */
export function useOptimizedPagination(
  initialPage: number = 1,
  initialLimit: number = 20
) {
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [total, setTotal] = useState(0)

  const pagination: PaginationInfo = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page < Math.ceil(total / limit),
    hasPrev: page > 1
  }

  const goToPage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage)
    }
  }

  const goToNextPage = () => {
    if (pagination.hasNext) {
      setPage(page + 1)
    }
  }

  const goToPrevPage = () => {
    if (pagination.hasPrev) {
      setPage(page - 1)
    }
  }

  const goToFirstPage = () => {
    setPage(1)
  }

  const goToLastPage = () => {
    setPage(pagination.totalPages)
  }

  const changeLimit = (newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when changing limit
  }

  const updateTotal = (newTotal: number) => {
    setTotal(newTotal)
  }

  const reset = () => {
    setPage(1)
    setLimit(initialLimit)
    setTotal(0)
  }

  return {
    pagination,
    goToPage,
    goToNextPage,
    goToPrevPage,
    goToFirstPage,
    goToLastPage,
    changeLimit,
    updateTotal,
    reset
  }
}
