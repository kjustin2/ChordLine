import type { ButtonHTMLAttributes, DetailedHTMLProps } from "react";

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const base = "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40";
  const variants: Record<string, string> = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:outline-indigo-500",
    secondary: "bg-white text-slate-900 border border-slate-300 hover:bg-slate-100 focus-visible:outline-indigo-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-indigo-500",
  };

  return <button type={type} className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
