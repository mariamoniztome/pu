import * as React from "react"
import { X } from "lucide-react"

import { cn } from "../../lib/utils"
import { useTranslation } from "../../hooks/useTranslation"

const DialogContext = React.createContext<{ onOpenChange?: (open: boolean) => void }>({})

const Dialog = ({ open, onOpenChange, children }: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) => {
  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={() => onOpenChange?.(false)}
          />
          <div className="relative z-50">
            {children}
          </div>
        </div>
      )}
    </DialogContext.Provider>
  )
}

const DialogTrigger = ({
  children,
  asChild,
  onClick
}: {
  children: React.ReactNode
  asChild?: boolean
  onClick?: () => void
}) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, { onClick } as any)
  }
  return <button onClick={onClick}>{children}</button>
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hideCloseButton?: boolean }
>(({ className, children, hideCloseButton, ...props }, ref) => {
  const { onOpenChange } = React.useContext(DialogContext)
  const { t } = useTranslation()

  return (
    <div
      ref={ref}
      className={cn(
        "relative bg-white rounded-3xl shadow-lg w-[45rem] max-h-[90vh] overflow-hidden flex flex-col",
        className
      )}
      {...props}
    >
      {!hideCloseButton && (
        <button
          type="button"
          onClick={() => onOpenChange?.(false)}
          className="absolute top-5 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          aria-label={t('common.close')}
          title={t('common.close')}
        >
          <X className="h-5 w-5" />
        </button>
      )}
      <div className="overflow-y-auto flex-1 px-8 py-8">
        {children}
      </div>
    </div>
  )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left mb-6 pr-10",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
}
