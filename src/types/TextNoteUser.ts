import type { Event } from 'nostr-tools';
import { User } from '@/types/User';
export interface TextNoteUser {
  textNote: Event;
  user?: User;
}
