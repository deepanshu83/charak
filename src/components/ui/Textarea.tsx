import React, { forwardRef } from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      id,
      name,
      required,
      className = "",
      wrapperClassName = "",
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || name || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`ui-form-field ${wrapperClassName}`.trim()}>
        {label && (
          <label htmlFor={textareaId} className="ui-field-label">
            {label} {required && <span className="field-required">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          required={required}
          rows={rows}
          className={`ui-textarea ${error ? "has-error" : ""} ${className}`.trim()}
          aria-invalid={!!error}
          aria-describedby={error && textareaId ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error ? (
          <span id={textareaId ? `${textareaId}-error` : undefined} className="ui-field-error" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span className="ui-field-helper">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
export default Textarea;
