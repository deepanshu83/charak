import React, { forwardRef } from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      name,
      required,
      className = "",
      wrapperClassName = "",
      ...props
    },
    ref
  ) => {
    const inputId = id || name || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`ui-form-field ${wrapperClassName}`.trim()}>
        {label && (
          <label htmlFor={inputId} className="ui-field-label">
            {label} {required && <span className="field-required">*</span>}
          </label>
        )}
        <div className={`ui-input-wrap ${leftIcon ? "has-left-icon" : ""} ${rightIcon ? "has-right-icon" : ""}`}>
          {leftIcon && <span className="ui-field-icon left">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            name={name}
            required={required}
            className={`ui-input ${error ? "has-error" : ""} ${className}`.trim()}
            aria-invalid={!!error}
            aria-describedby={error && inputId ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightIcon && <span className="ui-field-icon right">{rightIcon}</span>}
        </div>
        {error ? (
          <span id={inputId ? `${inputId}-error` : undefined} className="ui-field-error" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span className="ui-field-helper">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
