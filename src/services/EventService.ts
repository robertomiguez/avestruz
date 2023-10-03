import { SimplePool } from 'nostr-tools';
import { storeToRefs } from 'pinia';
import type { User } from '@/types/User';
import { useEventStore } from '@/stores/eventStore';
import { useUtilStore } from '@/stores/utilStore';

class EventService {
  static relays: string[] = import.meta.env.VITE_RELAYS.split(',');
  static eventStore = useEventStore();
  static utilStore = useUtilStore();

  static async getMetadatas(authors: string[]): Promise<User[]> {
    const { loading } = storeToRefs(EventService.utilStore);
    loading.value = true;
    if (!authors) return [];
    const pool = new SimplePool();

    const metadatas = await pool.list(EventService.relays, [
      {
        kinds: [0],
        authors,
      },
    ]);

    pool.close(EventService.relays);
    const users = metadatas.map(metadata => {
      return {
        ...{ pubkey: metadata.pubkey },
        ...JSON.parse(metadata?.content as string),
      };
    });
    loading.value = false;
    return users;
  }

  static async getEvents(pubkey: string[]): Promise<void> {
    const { loading } = storeToRefs(EventService.utilStore);
    loading.value = true;
    const { textNotesUsers } = storeToRefs(EventService.eventStore);
    textNotesUsers.value = [];

    if (!EventService.relays) {
      console.error('No Relay address registered.');
      return;
    }
    const pool = new SimplePool();

    const textNotes = await pool.list(EventService.relays, [
      {
        kinds: [1], // 0 metadata, 1 text note
        limit: +import.meta.env.VITE_SUB_LIMIT,
        // '#t': ['nostr'], //tags
        // authors: [
        //   '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2', // jack as na example
        // ],
        ...(pubkey.length && { authors: pubkey }),
      },
    ]);

    const authors = textNotes.map(textNote => textNote.pubkey);
    const users = await EventService.getMetadatas(authors);
    textNotesUsers.value = textNotes.map(textNote => {
      const user: User = users.find(u => u.pubkey === textNote.pubkey) as User;
      return { textNote, user };
    });

    pool.close(EventService.relays);
    loading.value = false;

    return;
  }
}

export default EventService;
