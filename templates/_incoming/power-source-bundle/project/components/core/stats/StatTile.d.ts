import * as React from "react";

/**
 * Performance stat tile — the brand's "Measured. Tracked. Proven." readout.
 * Big condensed numeral with an optional unit, eyebrow, caption and trend.
 *
 * @startingPoint section="Core" subtitle="Athletic performance stat readout" viewport="700x220"
 */
export interface StatTileProps {
  /** The headline number (string or number), e.g. "+4.2" or "1998". */
  value: React.ReactNode;
  /** Small unit appended in bolt yellow, e.g. "in", "s", "%". */
  unit?: React.ReactNode;
  /** Uppercase mono label above the value. */
  eyebrow?: React.ReactNode;
  /** Supporting line below the value. */
  caption?: React.ReactNode;
  /** Left accent bar color. @default "electric" */
  accent?: "electric" | "bolt";
  /** Optional trend chip: `{ dir: "up"|"down"|"flat", label: string }`. */
  trend?: { dir?: "up" | "down" | "flat"; label: string };
  className?: string;
}

export function StatTile(props: StatTileProps): JSX.Element;
