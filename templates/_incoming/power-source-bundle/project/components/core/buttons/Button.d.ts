import * as React from "react";

/**
 * Power Source primary action button. Blocky, uppercase, athletic.
 *
 * @startingPoint section="Core" subtitle="Athletic CTA button — primary, bolt, secondary, ghost" viewport="700x220"
 */
export interface ButtonProps {
  /** Button label / content. */
  children?: React.ReactNode;
  /** Visual style. `primary` = electric blue, `bolt` = yellow accent, `secondary` = steel navy, `ghost` = outline. */
  variant?: "primary" | "bolt" | "secondary" | "ghost";
  /** Control height. @default "md" */
  size?: "sm" | "md" | "lg";
  /** Stretch to fill the container width. */
  fullWidth?: boolean;
  /** Disabled state. */
  disabled?: boolean;
  /** Optional element rendered before the label (e.g. a Lucide icon). */
  iconLeft?: React.ReactNode;
  /** Optional element rendered after the label. */
  iconRight?: React.ReactNode;
  /** Render as a different element, e.g. "a" for links. @default "button" */
  as?: "button" | "a";
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: (e: React.MouseEvent) => void;
}

export function Button(props: ButtonProps): JSX.Element;
