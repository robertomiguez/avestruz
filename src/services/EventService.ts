import { SimplePool } from 'nostr-tools';
import { ref } from 'vue';
import { TextNoteUser } from '@/types/TextNoteUser';
import { checkImage } from '@/composables/checkImage';

class EventService {
  static async getEvents(): Promise<TextNoteUser[]> {
    const relays = import.meta.env.VITE_RELAYS.split(',');

    if (!relays) {
      console.log('No Relay address registered.');
      return [];
    }

    const poolTextNote = new SimplePool();
    const poolMetaData = new SimplePool();
    const textNotesUsers = ref<TextNoteUser[]>([]);

    const sub = poolTextNote.sub(relays, [
      {
        kinds: [1], // 0 metadata, 1 text note
        limit: import.meta.env.VITE_SUB_LIMIT,
        // '#t': ['nostr'], //tags
        // authors: [
        //   '82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2', // jack as na example
        // ],
      },
    ]);

    sub.on('event', async event => {
      const user = await poolMetaData.get(relays, {
        kinds: [0],
        authors: [event.pubkey],
      });

      const userParsed = user?.content
        ? { ...JSON.parse(user?.content as string), ...{ notFound: false } }
        : { pubkey: event.pubkey, notFound: true };

      userParsed.picture = await checkImage(
        userParsed?.picture as string,
        userParsed?.pubkey as string,
      );

      textNotesUsers.value.push({
        textNote: event,
        user: userParsed,
      });
    });

    sub.on('eose', () => {
      sub.unsub();
      console.log('textNotesUsers.value', textNotesUsers.value);
    });

    poolTextNote.close(relays);
    poolMetaData.close(relays);

    return textNotesUsers.value;
  }
}

export default EventService;
