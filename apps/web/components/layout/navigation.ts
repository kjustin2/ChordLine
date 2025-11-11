import type { ComponentType, SVGProps } from "react";
import {
  BanknotesIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  HomeModernIcon,
  LightBulbIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";

export type NavigationSection = {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const NAV_SECTIONS: NavigationSection[] = [
  { id: "overview", label: "Overview", description: "Profile, bands, highlights", icon: HomeModernIcon },
  { id: "events", label: "Events", description: "Upcoming schedule", icon: CalendarDaysIcon },
  { id: "setlists", label: "Setlists", description: "Show planning", icon: QueueListIcon },
  { id: "song-ideas", label: "Song Ideas", description: "Capture inspiration", icon: LightBulbIcon },
  { id: "venues", label: "Venues", description: "Spaces you play", icon: BuildingOffice2Icon },
  { id: "earnings", label: "Earnings", description: "Financial snapshot", icon: BanknotesIcon },
];
