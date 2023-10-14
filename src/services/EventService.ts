import { SimplePool } from 'nostr-tools';
import { storeToRefs } from 'pinia';
import type { User } from '@/types/User';
import { useEventStore } from '@/stores/eventStore';
import { useUtilStore } from '@/stores/utilStore';
import { nip05 } from 'nostr-tools';
// import { getUnixTime } from 'date-fns';

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

    const fillUser = async (metadata: any) => {
      const content = JSON.parse(metadata?.content as string);
      if (content.nip05 !== undefined) {
        const profile = await nip05.queryProfile(content.nip05);
        content.checked = profile?.pubkey === metadata.pubkey;
      }
      return {
        ...{ pubkey: metadata.pubkey },
        ...content,
      };
    };

    const users = async () => {
      return Promise.all(metadatas.map(metadata => fillUser(metadata)));
    };

    loading.value = false;
    return await users();
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

    // const since = getUnixTime(new Date()) - 60 * 60 * 1000;
    // const until = getUnixTime(new Date()) - 10 * 60 * 1000;
    const textNotes = await pool.list(EventService.relays, [
      {
        kinds: [1], // 0 metadata, 1 text note
        limit: +import.meta.env.VITE_SUB_LIMIT,
        // since,
        // until,
        // '#t': ['nostr'], //tags
        // authors: [
        //   'ee6ea13ab9fe5c4a68eaf9b1a34fe014a66b40117c50ee2a614f4cda959b6e74',
        // ],
        ...(pubkey.length && { authors: pubkey }),
      },
    ]);

    if (!textNotes.length) {
      console.error('textNotes empty.');
      return;
    }
    const authors = textNotes.map(textNote => textNote.pubkey);
    const users = await EventService.getMetadatas(authors);
    console.table(users);
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
