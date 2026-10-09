import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options?: SelectOption[];
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  children?: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      id,
      name,
      required,
      className = "",
      wrapperClassName = "",
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || name || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className={`ui-form-field ${wrapperClassName}`.trim()}>
        {label && (
          <label htmlFor={selectId} className="ui-field-label">
            {label} {required && <span className="field-required">*</span>}
          </label>
        )}
        <div className="ui-select-wrap">
          <select
            ref={ref}
            id={selectId}
            name={name}
            required={required}
            className={`ui-select ${error ? "has-error" : ""} ${className}`.trim()}
            aria-invalid={!!error}
            aria-describedby={error && selectId ? `${selectId}-error` : undefined}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <span className="ui-select-arrow" aria-hidden="true">
            <ChevronDown size={16} />
          </span>
        </div>
        {error ? (
          <span id={selectId ? `${selectId}-error` : undefined} className="ui-field-error" role="alert">
            {error}
          </span>
        ) : helperText ? (
          <span className="ui-field-helper">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
export default Select;
