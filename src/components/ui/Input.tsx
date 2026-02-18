"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      iconLeft,
      iconRight,
      className = "",
      containerClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-brand-text font-sans"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-secondary">
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full bg-brand-bg-secondary text-brand-text font-sans
              border border-brand-border rounded-xl
              px-4 py-3 text-sm
              placeholder:text-brand-text-secondary/50
              focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30
              transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              ${iconLeft ? "pl-10" : ""}
              ${iconRight ? "pr-10" : ""}
              ${error ? "border-brand-danger focus:border-brand-danger focus:ring-brand-danger/30" : ""}
              ${className}
            `}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-red-400 font-sans mt-0.5">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
