import { AppShell } from "@/components/layout/AppShell";
import { OverviewSection } from "@/components/dashboard/OverviewSection";
import { EventsSection } from "@/components/dashboard/EventsSection";
import { SetlistsSection } from "@/components/dashboard/SetlistsSection";
import { SongIdeasSection } from "@/components/dashboard/SongIdeasSection";
import { VenuesSection } from "@/components/dashboard/VenuesSection";
import { EarningsSection } from "@/components/dashboard/EarningsSection";

export default function Home() {
  return (
    <AppShell>
      <OverviewSection />
      <EventsSection />
      <SetlistsSection />
      <SongIdeasSection />
      <VenuesSection />
      <EarningsSection />
    </AppShell>
  );
}
