import * as React from "react";

/**
 * Filter / category chip. Heavier than Badge; used for program filters and tag inputs.
 */
export interface TagProps {
  children?: React.ReactNode;
  /** Selected state (filled electric). */
  active?: boolean;
  /** "default" or "bolt" outline. @default "default" */
  variant?: "default" | "bolt";
  /** When provided, renders a removable × affordance. */
  onRemove?: (e: React.MouseEvent) => void;
  className?: string;
}

export function Tag(props: TagProps): JSX.Element;
