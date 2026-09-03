import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  href?: string;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  href,
  loading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-accent text-white hover:bg-accent-hover active:scale-[0.98] border border-accent hover:shadow-[0_0_20px_rgba(10,132,255,0.25)]",
    secondary:
      "bg-transparent text-text-primary border border-border hover:border-text-tertiary hover:bg-tertiary active:scale-[0.98]",
    ghost:
      "bg-transparent text-text-secondary hover:text-text-primary hover:bg-tertiary border border-transparent",
    danger:
      "bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 active:scale-[0.98]",
  };

  const sizes = {
    sm: "text-body-sm px-3 py-1.5 gap-1.5",
    md: "text-body-md px-5 py-2.5 gap-2",
    lg: "text-body-lg px-7 py-3.5 gap-2.5",
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
