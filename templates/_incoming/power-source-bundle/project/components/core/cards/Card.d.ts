import * as React from "react";

/**
 * Generic surface container. Raised (dark), steel (navy gradient) or light.
 * Optional top accent bar and interactive hover-lift.
 */
export interface CardProps {
  children?: React.ReactNode;
  /** Surface style. @default "raised" */
  variant?: "raised" | "steel" | "light";
  /** Top accent bar. @default "none" */
  accent?: "none" | "bolt" | "electric";
  /** Adds hover-lift + pointer cursor. */
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
}

export function Card(props: CardProps): JSX.Element;
