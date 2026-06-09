import * as React from "react";

/**
 * Section heading lockup — mono eyebrow (with bolt tick), condensed display
 * title and optional subtitle. The standard way to open a marketing section.
 *
 * @startingPoint section="Core" subtitle="Eyebrow + condensed display section heading" viewport="700x240"
 */
export interface SectionHeadingProps {
  /** Small uppercase label above the title. */
  eyebrow?: React.ReactNode;
  /** The headline. Wrap words in <span className="hl"> for bolt-yellow emphasis. */
  title: React.ReactNode;
  /** Supporting paragraph. */
  subtitle?: React.ReactNode;
  /** @default "left" */
  align?: "left" | "center";
  /** "dark" for dark surfaces, "light" for light sections. @default "dark" */
  tone?: "dark" | "light";
  className?: string;
}

export function SectionHeading(props: SectionHeadingProps): JSX.Element;
