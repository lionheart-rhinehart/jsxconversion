import * as React from "react";

/**
 * Testimonial / review card — star rating, quote, and an author row with Avatar.
 * Mirrors the parent reviews on the marketing site.
 */
export interface TestimonialProps {
  /** The quote text. */
  quote: React.ReactNode;
  /** Author name (drives Avatar initials). */
  name: string;
  /** Author role/meta, e.g. "Hockey parent · 6 yrs". */
  role?: React.ReactNode;
  /** Optional author photo URL. */
  avatarSrc?: string;
  /** Star rating 0–5; pass 0 to show a quote mark instead. @default 5 */
  rating?: number;
  className?: string;
}

export function Testimonial(props: TestimonialProps): JSX.Element;
