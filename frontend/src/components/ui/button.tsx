import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "accent" | "outline" | "ghost" | "link" | "subtle";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111965] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]";

    const variantStyles = {
      default: "bg-[#111965] text-white hover:bg-[#1E277A] shadow-sm shadow-[#111965]/20",
      accent: "bg-[#F7CE4D] text-[#0F1754] dark:text-[#0F1754] hover:bg-[#E5BD3B] font-bold shadow-sm shadow-[#F7CE4D]/20",
      outline: "border-2 border-[#E6E8F0] bg-white text-[#171A2C] hover:bg-[#F5F6FA] hover:border-slate-300",
      ghost: "text-[#68708A] hover:text-[#111965] hover:bg-[#F0F2FA]",
      link: "text-[#111965] underline-offset-4 hover:underline p-0 h-auto",
      subtle: "bg-[#F0F2FA] text-[#111965] hover:bg-[#E6E8F0]",
    };

    const sizeStyles = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-2xl px-6 text-sm font-bold",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

