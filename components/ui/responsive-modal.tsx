"use client"

import * as React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface ResponsiveModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

interface ResponsiveModalContentProps {
  children: React.ReactNode
  className?: string
  /**
   * Si es true, el modal en móvil ocupará toda la pantalla
   * Si es false, será un bottom sheet (por defecto)
   */
  fullScreenOnMobile?: boolean
}

interface ResponsiveModalHeaderProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveModalTitleProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveModalDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface ResponsiveModalFooterProps {
  children: React.ReactNode
  className?: string
}

const ResponsiveModal = ({ open, onOpenChange, children }: ResponsiveModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  )
}

const ResponsiveModalContent = ({
  children,
  className,
  fullScreenOnMobile = false
}: ResponsiveModalContentProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <DialogContent className={cn("sm:max-w-[600px]", className)}>
        {children}
      </DialogContent>
    )
  }

  // En móvil, usar fullscreen si el contenido es muy complejo
  if (fullScreenOnMobile) {
    return (
      <SheetContent
        side="bottom"
        className={cn(
          "h-[100dvh] max-h-[100dvh] p-0 flex flex-col",
          className
        )}
      >
        {children}
      </SheetContent>
    )
  }

  // Por defecto, usar bottom sheet con altura adaptativa
  return (
    <SheetContent
      side="bottom"
      className={cn(
        "max-h-[90vh] rounded-t-[20px] p-6 pb-safe",
        className
      )}
    >
      {children}
    </SheetContent>
  )
}

const ResponsiveModalHeader = ({ children, className }: ResponsiveModalHeaderProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return <DialogHeader className={className}>{children}</DialogHeader>
  }

  return <SheetHeader className={className}>{children}</SheetHeader>
}

const ResponsiveModalTitle = ({ children, className }: ResponsiveModalTitleProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return <DialogTitle className={className}>{children}</DialogTitle>
  }

  return <SheetTitle className={className}>{children}</SheetTitle>
}

const ResponsiveModalDescription = ({ children, className }: ResponsiveModalDescriptionProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return <DialogDescription className={className}>{children}</DialogDescription>
  }

  return <SheetDescription className={className}>{children}</SheetDescription>
}

const ResponsiveModalFooter = ({ children, className }: ResponsiveModalFooterProps) => {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return <DialogFooter className={className}>{children}</DialogFooter>
  }

  return <SheetFooter className={className}>{children}</SheetFooter>
}

export {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
}
