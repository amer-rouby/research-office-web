import { LucideIcon } from '@lucide/angular';

/** One navigation entry of a shell; shells are configured with these via route data. */
export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: LucideIcon;
  /** Highlight only on an exact URL match (use for an area's home). */
  readonly exact?: boolean;
}
