"use client"

import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"

interface DroppableAreaProps {
  id: string
  children: React.ReactNode
  className?: string
  isOver?: boolean
}

export function DroppableArea({ 
  id, 
  children, 
  className,
  isOver = false 
}: DroppableAreaProps) {
  const { isOver: isDroppableOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-all duration-200",
        isDroppableOver || isOver
          ? "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 scale-105"
          : "hover:bg-gray-50",
        className
      )}
    >
      {children}
    </div>
  )
}
