import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = "", id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="mono-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-secondary border border-border text-text-primary rounded px-4 py-3 text-body-md transition-all duration-200 placeholder:text-text-tertiary focus:border-accent focus:shadow-[0_0_0_3px_rgba(10,132,255,0.12)] focus:outline-none ${
          error ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(230,57,70,0.12)]" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-danger text-body-xs">{error}</span>}
      {hint && !error && <span className="text-text-tertiary text-body-xs">{hint}</span>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className = "", id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="mono-label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`bg-secondary border border-border text-text-primary rounded px-4 py-3 text-body-md transition-all duration-200 placeholder:text-text-tertiary focus:border-accent focus:shadow-[0_0_0_3px_rgba(10,132,255,0.12)] focus:outline-none resize-y min-h-[100px] ${
          error ? "border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(230,57,70,0.12)]" : ""
        } ${className}`}
        {...props}
      />
      {error && <span className="text-danger text-body-xs">{error}</span>}
      {hint && !error && <span className="text-text-tertiary text-body-xs">{hint}</span>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({ label, error, options, placeholder, className = "", id, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="mono-label">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`bg-secondary border border-border text-text-primary rounded px-4 py-3 text-body-md transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(10,132,255,0.12)] focus:outline-none appearance-none cursor-pointer ${
          error ? "border-danger" : ""
        } ${className}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-danger text-body-xs">{error}</span>}
    </div>
  );
}
