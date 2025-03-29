import { cva, VariantProps } from "class-variance-authority";
import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Slot } from '@radix-ui/react-slot';

export const buttonVariants = cva("flex cursor-pointer items-center rounded-lg px-4 py-2 leading-6 text-white duration-200 disabled:cursor-not-allowed motion-reduce:transition-none", {
 variants: {
  variant: {
   primary: "bg-button-primary hover:bg-button-primary-hover disabled:bg-button-primary/50 disabled:hover:bg-button-primary-hover/50",
   secondary: "bg-button-secondary hover:bg-button-secondary-hover disabled:bg-button-secondary/30 hover:disabled:bg-button-secondary-hover/40",
   red: "bg-red-400/20 hover:bg-red-400/50 disabled:bg-red-400/10",
   discord: "bg-[#5964f2] hover:bg-[#4753c5] disabled:bg-[#5964f2]/50 disabled:hover:bg-[#4753c5]",
  },
  size: {
   default: "h-10 px-4 py-2",
   sm: "h-9 rounded-md px-3",
   lg: "h-11 rounded-md px-8",
   icon: "h-10 w-10 p-0",
  },
 },
 defaultVariants: {
  variant: "primary",
  size: "default",
 },
});

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, 
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp 
        className={cn(buttonVariants({ variant, size }), className)} 
        ref={ref} 
        {...props} 
        type={props.type ?? "button"}
      >
        {props.children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';
