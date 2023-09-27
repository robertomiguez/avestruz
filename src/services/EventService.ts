import { SimplePool } from 'nostr-tools';
import { storeToRefs } from 'pinia';
import { useEventStore } from '@/stores/eventStore';

class EventService {
  static async getEvents(): Promise<void> {
    const eventStore = useEventStore();
    const { textNotesUsers } = storeToRefs(eventStore);
    const relays = import.meta.env.VITE_RELAYS.split(',');

    if (!relays) {
      console.log('No Relay address registered.');
      return;
    }
    const pool = new SimplePool();

    const textNotes = await pool.list(relays, [
      {
        kinds: [1], // 0 metadata, 1 text note
        limit: +import.meta.env.VITE_SUB_LIMIT,
        // '#t': ['nostr'], //tags
        // authors: [
        //   '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2', // jack as na example
        // ],
      },
    ]);

    const authors = textNotes.map(textNote => textNote.pubkey);
    const metadatas = await pool.list(relays, [
      {
        kinds: [0],
        authors,
      },
    ]);

    textNotesUsers.value = textNotes.map(textNote => {
      const metadata = metadatas.find(u => u.pubkey === textNote.pubkey);
      const user = metadata ? JSON.parse(metadata?.content as string) : {};
      return { textNote, user };
    });

    pool.close(relays);

    // console.log(textNotesUsers.value, 'lenght', textNotesUsers.value.length);

    return;
  }
}

export default EventService;
