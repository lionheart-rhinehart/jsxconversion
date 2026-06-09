import * as React from "react";

/**
 * Program offering card — icon, program name (condensed display), description,
 * meta label and a CTA. Used on the marketing site's programs grid.
 *
 * @startingPoint section="Core" subtitle="Program offering tile with icon, title, CTA" viewport="700x300"
 */
export interface ProgramCardProps {
  /** Program name, e.g. "Speed School". */
  title: React.ReactNode;
  /** Short description. */
  description: React.ReactNode;
  /** Mono meta label, e.g. "Ages 8–18". */
  meta?: React.ReactNode;
  /** Icon node (e.g. a Lucide <i data-lucide="zap" />). */
  icon?: React.ReactNode;
  /** CTA label. @default "Learn More" */
  cta?: React.ReactNode;
  /** Icon + CTA accent. @default "electric" */
  accent?: "electric" | "bolt";
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function ProgramCard(props: ProgramCardProps): JSX.Element;
