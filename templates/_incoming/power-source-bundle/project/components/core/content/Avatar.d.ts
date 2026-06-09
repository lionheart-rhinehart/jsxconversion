import * as React from "react";

/** Circular avatar — image or auto initials from `name`. */
export interface AvatarProps {
  /** Image URL; falls back to initials. */
  src?: string;
  /** Full name — initials are derived from this. */
  name?: string;
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Fallback background. @default "steel" */
  accent?: "steel" | "bolt";
  /** Electric focus ring. */
  ring?: boolean;
  className?: string;
}

export function Avatar(props: AvatarProps): JSX.Element;
