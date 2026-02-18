"use client";

import React, { forwardRef, useCallback, useEffect, useRef } from "react";

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  autoResize?: boolean;
  showCharCount?: boolean;
  maxCharacters?: number;
  containerClassName?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      autoResize = false,
      showCharCount = false,
      maxCharacters,
      className = "",
      containerClassName = "",
      id,
      value,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    const adjustHeight = useCallback(() => {
      if (autoResize && internalRef.current) {
        internalRef.current.style.height = "auto";
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    }, [autoResize]);

    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    const currentLength =
      typeof value === "string" ? value.length : 0;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (maxCharacters && e.target.value.length > maxCharacters) {
        return;
      }
      onChange?.(e);
    };

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
        <textarea
          ref={setRefs}
          id={inputId}
          value={value}
          onChange={handleChange}
          className={`
            w-full bg-brand-bg-secondary text-brand-text font-sans
            border border-brand-border rounded-xl
            px-4 py-3 text-sm
            placeholder:text-brand-text-secondary/50
            focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold/30
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
            ${autoResize ? "overflow-hidden" : ""}
            ${error ? "border-brand-danger focus:border-brand-danger focus:ring-brand-danger/30" : ""}
            ${className}
          `}
          rows={props.rows || 4}
          {...props}
        />
        <div className="flex items-center justify-between">
          {error && (
            <p className="text-xs text-red-400 font-sans">{error}</p>
          )}
          {showCharCount && (
            <p
              className={`text-xs font-sans ml-auto ${
                maxCharacters && currentLength >= maxCharacters
                  ? "text-red-400"
                  : "text-brand-text-secondary"
              }`}
            >
              {currentLength}
              {maxCharacters ? ` / ${maxCharacters}` : ""}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
