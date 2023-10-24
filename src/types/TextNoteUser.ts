import { TextNote } from '@/types/TextNote';
import { User } from '@/types/User';
export interface TextNoteUser {
  textNote: TextNote;
  user?: User;
}
