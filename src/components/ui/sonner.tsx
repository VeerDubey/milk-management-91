
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border-primary/20 group-[.toaster]:shadow-2xl group-[.toaster]:backdrop-blur-xl",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:border-success/50 group-[.toast]:bg-success/10",
          error: "group-[.toast]:border-destructive/50 group-[.toast]:bg-destructive/10",
          warning: "group-[.toast]:border-warning/50 group-[.toast]:bg-warning/10",
          info: "group-[.toast]:border-primary/50 group-[.toast]:bg-primary/10",
        },
      }}
      position="top-right"
      expand={true}
      richColors={true}
      {...props}
    />
  )
}

export { Toaster }
