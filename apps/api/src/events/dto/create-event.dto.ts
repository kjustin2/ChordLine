import type { EventStatus, EventType } from '@chordline/types';

export class CreateEventDto {
  title!: string;
  description?: string;
  type?: EventType;
  status?: EventStatus;
  venueId?: string;
  locationName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  startsAt!: string;
  endsAt?: string;
  doorTime?: string;
  rsvpDeadline?: string;
  notes?: string;
}
