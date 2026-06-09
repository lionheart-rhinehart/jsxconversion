import * as React from "react";

/**
 * Text input with label, optional leading icon, helper text and error state.
 * Dark-surface field; focus ring is electric blue.
 */
export interface InputProps {
  /** Field label rendered above the input. */
  label?: React.ReactNode;
  /** Marks the field required (bolt-yellow asterisk). */
  required?: boolean;
  /** Leading icon node (e.g. Lucide). */
  icon?: React.ReactNode;
  /** Error message — also turns the border red. */
  error?: React.ReactNode;
  /** Helper text shown when there's no error. */
  helper?: React.ReactNode;
  id?: string;
  placeholder?: string;
  type?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Input(props: InputProps): JSX.Element;
