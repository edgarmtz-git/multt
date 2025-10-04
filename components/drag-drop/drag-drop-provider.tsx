"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface DragDropContextType {
  draggedProduct: any | null
  setDraggedProduct: (product: any | null) => void
  targetCategory: string | null
  setTargetCategory: (categoryId: string | null) => void
  isDragging: boolean
  setIsDragging: (dragging: boolean) => void
}

const DragDropContext = createContext<DragDropContextType | undefined>(undefined)

export function DragDropProvider({ children }: { children: ReactNode }) {
  const [draggedProduct, setDraggedProduct] = useState<any | null>(null)
  const [targetCategory, setTargetCategory] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  return (
    <DragDropContext.Provider
      value={{
        draggedProduct,
        setDraggedProduct,
        targetCategory,
        setTargetCategory,
        isDragging,
        setIsDragging
      }}
    >
      {children}
    </DragDropContext.Provider>
  )
}

export function useDragDrop() {
  const context = useContext(DragDropContext)
  if (context === undefined) {
    throw new Error("useDragDrop must be used within a DragDropProvider")
  }
  return context
}
