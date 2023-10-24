import { storeToRefs } from 'pinia';
import type { TextNote } from '@/types/TextNote';
import type { User } from '@/types/User';
import { useEventStore } from '@/stores/eventStore';
import { useUtilStore } from '@/stores/utilStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { nip05 } from 'nostr-tools';

class EventService {
  static relays: string[] = import.meta.env.VITE_RELAYS.split(',');
  static eventStore = useEventStore();
  static utilStore = useUtilStore();
  private static loading = storeToRefs(EventService.utilStore).loading;
  private static textNotes: TextNote[] = [];
  private static users: User[] = [];
  private static textNotesUsers = storeToRefs(EventService.eventStore)
    .textNotesUsers;

  private static wsOpen = (
    ws: WebSocket,
    relay: string,
    authors: string[],
    kind: number,
  ) => {
    ws.addEventListener('open', () => {
      const req = {
        kinds: [kind], // 0 metadata, 1 text note
        limit: +import.meta.env.VITE_SUB_LIMIT,
        ...(authors.length && { authors }),
      };
      ws.send(`["REQ", "my-sub", ${JSON.stringify(req)} ]`);
    });
  };

  private static wsMessage = (
    ws: WebSocket,
    relay: string,
    fn: (ws: WebSocket, relay: string, messageData: any) => void,
  ) => {
    ws.addEventListener('message', event => {
      const messageData = JSON.parse(event.data)[2];
      fn(ws, relay, messageData);
    });
  };

  private static fillTextNote = (
    ws: WebSocket,
    relay: string,
    messageData: any,
  ) => {
    if (messageData != null) {
      EventService.textNotes.push({ ...messageData, ...{ relay } });
    } else {
      ws.close();
      const authors = [
        ...new Set(EventService.textNotes.map(textNote => textNote.pubkey)),
      ];
      console.table(EventService.textNotes);
      if (authors.length) {
        EventService.initializeWsMetadata(relay, authors);
      }
    }
  };

  private static initializeTextNote = (relay: string, authors: string[]) => {
    const wsTextNotes = new WebSocket(relay);
    EventService.wsOpen(wsTextNotes, relay, authors, 1);
    EventService.wsMessage(wsTextNotes, relay, EventService.fillTextNote);
  };

  private static fillMetadata = async (
    ws: WebSocket,
    relay: string,
    messageData: any,
  ) => {
    if (messageData != null) {
      EventService.users.push({
        ...{ pubkey: messageData.pubkey, relay },
        ...JSON.parse(messageData.content),
      });
    } else {
      console.table(EventService.users);
      ws.close();

      EventService.textNotesUsers.value = EventService.textNotes
        .map(textNote => {
          const user: User = EventService.users.find(
            u => u.pubkey === textNote.pubkey && u.relay === textNote.relay,
          ) as User;
          const profile = async () => {
            if (user?.nip05) {
              const profile = await nip05.queryProfile(user.nip05 as string);
              user.checked = profile?.pubkey === user.pubkey;
            }
          };
          profile();
          // const isDuplicate = EventService.textNotesUsers.value.some(
          //   item =>
          //     JSON.stringify(item.textNote) === JSON.stringify(textNote) &&
          //     JSON.stringify(item.user) === JSON.stringify(user),
          // );
          // console.log('isDuplicate', isDuplicate);
          // if (isDuplicate) {
          //   return { textNote };
          // } else {
          return { textNote, user };
          // }
        })
        .filter(textNote => textNote.user !== undefined);

      EventService.textNotesUsers.value.sort((a, b) => {
        if (a?.user?.pubkey !== undefined && b?.user?.pubkey !== undefined) {
          return a.user.pubkey.localeCompare(b.user.pubkey);
        } else {
          return 0; // Handle cases where a or b (or both) do not have a user or pubkey
        }
      });
      EventService.loading.value = false;
    }
  };

  static initializeWsMetadata = (relay: string, authors: string[]) => {
    const wsMetadata = new WebSocket(relay);
    EventService.wsOpen(wsMetadata, relay, authors, 0);
    EventService.wsMessage(wsMetadata, relay, EventService.fillMetadata);
  };

  static getEvents(pubkey: string[]): void {
    if (!EventService.relays) {
      console.error('No Relay address registered.');
      return;
    }

    EventService.loading.value = true;
    EventService.textNotes = [];
    EventService.users = [];

    const relays: string[] = import.meta.env.VITE_RELAYS.split(',');

    for (const relay of relays) {
      EventService.initializeTextNote(relay, pubkey);
    }

    return;
  }

  private static fillMyUser = (
    ws: WebSocket,
    relay: string,
    messageData: any,
  ) => {
    //TODO: STATIC
    const settingsStore = useSettingsStore();
    const { profile } = storeToRefs(settingsStore);
    if (messageData != null) {
      // const content = JSON.parse(messageData.content);
      // const pubkey = messageData.pubkey;
      profile.value = {
        ...JSON.parse(messageData.content),
        ...{ pubkey: messageData.pubkey },
      };
    } else {
      ws.close();
      EventService.loading.value = false;
    }
  };

  static initializeWsMyUser = (relay: string, authors: string[]) => {
    const wsMetadata = new WebSocket(relay);
    EventService.wsOpen(wsMetadata, relay, authors, 0);
    EventService.wsMessage(wsMetadata, relay, EventService.fillMyUser);
  };

  // static getMyUser(pubkey: string[]): void {
  //   //TODO static
  //   const relays: string[] = import.meta.env.VITE_RELAYS.split(',');
  //   for (const relay of relays) {
  //     // EventService.initializeWsMyUser(relay, pubkey);
  //     EventService.initializeTextNote(relay, pubkey);
  //   }
  //   return;
  // }
}

export default EventService;
