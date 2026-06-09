import * as React from "react";

/**
 * Small status pill. Mono, uppercase, used for labels like "Member", "Speed School", status.
 */
export interface BadgeProps {
  children?: React.ReactNode;
  /** Color role. @default "electric" */
  variant?: "electric" | "bolt" | "steel" | "success" | "danger" | "neutral" | "outline";
  /** Show a leading status dot. */
  dot?: boolean;
  className?: string;
}

export function Badge(props: BadgeProps): JSX.Element;
