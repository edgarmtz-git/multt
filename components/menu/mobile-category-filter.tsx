'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, X } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface Category {
  id: string
  name: string
  description: string
  color: string
  icon: string
  order: number
  isActive: boolean
  products: any[]
}

interface MobileCategoryFilterProps {
  categories: Category[]
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
  totalProducts: number
}

export function MobileCategoryFilter({
  categories,
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategorySelect,
  totalProducts
}: MobileCategoryFilterProps) {
  const [showFilters, setShowFilters] = useState(false)

  const activeCategories = categories.filter(cat => cat.isActive && cat.products.length > 0)
  
  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      {/* Barra de búsqueda */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 h-11 text-base rounded-xl border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filtros de categoría */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-gray-700">
              Categorías
            </h3>
            <Badge variant="secondary" className="text-xs">
              {totalProducts} productos
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            <Filter className="w-3 h-3 mr-1" />
            {showFilters ? 'Ocultar' : 'Ver todas'}
          </Button>
        </div>

        {/* Categorías - Scroll horizontal */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* Botón "Todas" */}
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => onCategorySelect(null)}
            className={`whitespace-nowrap px-4 py-2 h-9 text-sm font-medium rounded-full ${
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas
            <Badge 
              variant="secondary" 
              className={`ml-2 text-xs ${
                selectedCategory === null 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {totalProducts}
            </Badge>
          </Button>

          {/* Categorías individuales */}
          {activeCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategorySelect(category.id)}
              className={`whitespace-nowrap px-4 py-2 h-9 text-sm font-medium rounded-full ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
              <Badge 
                variant="secondary" 
                className={`ml-2 text-xs ${
                  selectedCategory === category.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {category.products.length}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="mt-3 p-3 bg-gray-50 rounded-xl animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2">
              {activeCategories.map((category) => (
                <Button
                  key={category.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onCategorySelect(category.id)}
                  className={`justify-start h-10 text-sm ${
                    selectedCategory === category.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  <span className="truncate">{category.name}</span>
                  <Badge 
                    variant="secondary" 
                    className="ml-auto text-xs"
                  >
                    {category.products.length}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
