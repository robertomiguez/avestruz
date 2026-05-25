import { storeToRefs } from 'pinia';
import type { TextNote } from '@/types/TextNote';
import type { User } from '@/types/User';
import { useEventStore } from '@/stores/eventStore';
import { useUtilStore } from '@/stores/utilStore';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  nip05,
  finishEvent,
  SimplePool,
  validateEvent,
  verifySignature,
  type Event as NostrEvent,
  type EventTemplate,
} from 'nostr-tools';

export interface PublishRelayResult {
  relay: string;
  status: 'accepted' | 'failed';
  message?: string;
}

export interface ProfileMetadata {
  banner?: string;
  website?: string;
  picture?: string;
  display_name?: string;
  about?: string;
  name?: string;
  nip05?: string;
}

export interface BlossomBlobDescriptor {
  url: string;
  sha256: string;
  size: number;
  type: string;
  uploaded: number;
}

class EventService {
  static getRelays(): string[] {
    return (import.meta.env.VITE_RELAYS ?? '')
      .split(',')
      .map((relay: string) => relay.trim())
      .filter(Boolean);
  }

  static getBlossomServer(): string | undefined {
    const server = import.meta.env.VITE_BLOSSOM_SERVER?.trim();

    if (!server) {
      return undefined;
    }

    return server.replace(/\/+$/, '');
  }

  private static eventStore = useEventStore();
  private static utilStore = useUtilStore();
  private static settingsStore = useSettingsStore();
  private static loading = storeToRefs(EventService.utilStore).loading;
  private static textNotes: TextNote[] = [];
  private static users: User[] = [];
  private static textNotesUsers = storeToRefs(EventService.eventStore)
    .textNotesUsers;
  private static shouldVerifyNip05 = import.meta.env.VITE_VERIFY_NIP05 === 'true';
  private static publishTimeoutMs = 10000;

  private static isValidNip05 = (nip05Address: string): boolean => {
    const [name, domain] = nip05Address.includes('@')
      ? nip05Address.split('@')
      : ['_', nip05Address];

    return Boolean(
      name &&
        domain &&
        domain.includes('.') &&
        !domain.includes(' ') &&
        !domain.includes('/'),
    );
  };

  private static verifyNip05 = async (user: User): Promise<void> => {
    if (
      !EventService.shouldVerifyNip05 ||
      !user.nip05 ||
      !EventService.isValidNip05(user.nip05)
    ) {
      return;
    }

    try {
      const profile = await nip05.queryProfile(user.nip05);
      user.checked = profile?.pubkey === user.pubkey;
    } catch {
      user.checked = false;
    }
  };

  private static withPublishTimeout = (
    relay: string,
    publish: Promise<void>,
  ): Promise<void> =>
    Promise.race([
      publish,
      new Promise<void>((_, reject) => {
        window.setTimeout(
          () => reject(new Error(`Timed out publishing to ${relay}.`)),
          EventService.publishTimeoutMs,
        );
      }),
    ]);

  private static base64UrlEncode = (value: string): string => {
    const bytes = new TextEncoder().encode(value);
    let binary = '';

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return window
      .btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  };

  private static sha256Hex = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hash = await window.crypto.subtle.digest('SHA-256', buffer);

    return Array.from(new Uint8Array(hash))
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  };

  private static parseProfileMetadata = (
    content: unknown,
  ): ProfileMetadata | undefined => {
    if (typeof content !== 'string') {
      return undefined;
    }

    try {
      const metadata = JSON.parse(content);

      if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
        return undefined;
      }

      return metadata as ProfileMetadata;
    } catch {
      return undefined;
    }
  };

  private static signAndPublish = async (
    event: EventTemplate,
  ): Promise<{
    relayResults: PublishRelayResult[];
    signedEvent?: NostrEvent;
  }> => {
    const relays = EventService.getRelays();

    if (!relays.length) {
      console.error('No Relay address registered.');
      return { relayResults: [] };
    }

    const { privateKeyHex } = storeToRefs(EventService.settingsStore);
    if (!privateKeyHex.value) {
      console.error('No private key registered.');
      return { relayResults: [] };
    }

    const signedEvent = finishEvent(event, privateKeyHex.value);
    const valid = validateEvent(signedEvent);
    const verified = verifySignature(signedEvent);

    if (!valid || !verified) {
      console.error('invalid event');
      return {
        relayResults: relays.map(relay => ({
          relay,
          status: 'failed',
          message: 'Invalid signed event.',
        })),
        signedEvent,
      };
    }

    const pool = new SimplePool();
    const pubs = pool
      .publish(relays, signedEvent)
      .map((publish, index) =>
        EventService.withPublishTimeout(relays[index], publish),
      );
    const results = await Promise.allSettled(pubs);
    const relayResults: PublishRelayResult[] = results.map((result, index) => ({
      relay: relays[index],
      status: result.status === 'fulfilled' ? 'accepted' : 'failed',
      message:
        result.status === 'rejected'
          ? result.reason?.message ?? 'Relay rejected or disconnected.'
          : undefined,
    }));

    pool.close(relays);

    return { relayResults, signedEvent };
  };

  private static createBlossomAuthorization = (
    action: 'upload',
    blobHash: string,
    server: string,
  ): string | undefined => {
    const { privateKeyHex } = storeToRefs(EventService.settingsStore);

    if (!privateKeyHex.value) {
      console.error('No private key registered.');
      return undefined;
    }

    const hostname = new URL(server).hostname.toLowerCase();
    const event: EventTemplate<24242> = {
      kind: 24242,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ['t', action],
        ['expiration', `${Math.floor(Date.now() / 1000) + 10 * 60}`],
        ['server', hostname],
        ['x', blobHash],
      ],
      content: 'Upload avatar',
    };
    const signedEvent = finishEvent(event, privateKeyHex.value);
    const valid = validateEvent(signedEvent);
    const verified = verifySignature(signedEvent);

    if (!valid || !verified) {
      console.error('invalid blossom authorization event');
      return undefined;
    }

    return EventService.base64UrlEncode(JSON.stringify(signedEvent));
  };

  private static parseBlobDescriptor = (
    value: unknown,
  ): BlossomBlobDescriptor | undefined => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    const descriptor = value as Partial<BlossomBlobDescriptor>;

    if (
      typeof descriptor.url !== 'string' ||
      typeof descriptor.sha256 !== 'string' ||
      typeof descriptor.size !== 'number' ||
      typeof descriptor.type !== 'string' ||
      typeof descriptor.uploaded !== 'number'
    ) {
      return undefined;
    }

    return descriptor as BlossomBlobDescriptor;
  };

  private static syncTextNotesUsers = (): void => {
    EventService.textNotesUsers.value = EventService.textNotes.map(textNote => {
      const user = EventService.users.find(
        u => u.pubkey === textNote.pubkey && u.relay === textNote.relay,
      );

      if (user) {
        EventService.verifyNip05(user);
      }

      return { textNote, user };
    });

    EventService.textNotesUsers.value.sort((a, b) => {
      return b.textNote.created_at - a.textNote.created_at;
    });
  };

  private static addPublishedNote = (
    signedEvent: TextNote,
    acceptedRelays: string[],
  ): void => {
    for (const relay of acceptedRelays) {
      const exists = EventService.textNotes.some(
        textNote => textNote.id === signedEvent.id && textNote.relay === relay,
      );

      if (!exists) {
        EventService.textNotes.push({ ...signedEvent, relay });
      }
    }

    EventService.syncTextNotesUsers();
  };

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

  private static wsError = (ws: WebSocket) => {
    ws.addEventListener('error', () => {
      EventService.loading.value = false;

      if (
        ws.readyState === WebSocket.CONNECTING ||
        ws.readyState === WebSocket.OPEN
      ) {
        ws.close();
      }
    });
  };

  private static wsMessage = (
    ws: WebSocket,
    relay: string,
    fn: (ws: WebSocket, relay: string, messageData: any) => void,
  ) => {
    ws.addEventListener('message', event => {
      try {
        const message = JSON.parse(event.data);

        if (!Array.isArray(message)) {
          return;
        }

        if (message[0] === 'EVENT') {
          fn(ws, relay, message[2]);
          return;
        }

        if (message[0] === 'EOSE') {
          fn(ws, relay, undefined);
        }
      } catch {
        ws.close();
        EventService.loading.value = false;
      }
    });
  };

  // static wsClose(ws: WebSocket) {
  //   ws.addEventListener('close', event => {
  //     console.log('ws', event);
  //   });
  // }

  private static fillTextNote = (
    ws: WebSocket,
    relay: string,
    messageData: any,
  ) => {
    if (messageData != null) {
      EventService.textNotes.push({ ...messageData, ...{ relay } });
      EventService.syncTextNotesUsers();
    } else {
      ws.close();
      const authors = [
        ...new Set(EventService.textNotes.map(textNote => textNote.pubkey)),
      ];
      EventService.syncTextNotesUsers();
      EventService.loading.value = false;
      if (authors.length) {
        EventService.initializeWsMetadata(relay, authors);
      }
    }
  };

  private static initializeTextNote = (relay: string, authors: string[]) => {
    let wsTextNotes: WebSocket;

    try {
      wsTextNotes = new WebSocket(relay);
    } catch {
      EventService.loading.value = false;
      return;
    }

    EventService.wsError(wsTextNotes);
    EventService.wsOpen(wsTextNotes, relay, authors, 1);
    EventService.wsMessage(wsTextNotes, relay, EventService.fillTextNote);
  };

  private static fillMetadata = async (
    ws: WebSocket,
    relay: string,
    messageData: any,
  ) => {
    if (messageData != null) {
      const metadata = EventService.parseProfileMetadata(messageData.content);

      if (!metadata) {
        return;
      }

      EventService.users.push({
        ...{ pubkey: messageData.pubkey, relay },
        ...metadata,
      });
    } else {
      ws.close();

      EventService.syncTextNotesUsers();
      EventService.loading.value = false;
    }
  };

  static initializeWsMetadata = (relay: string, authors: string[]) => {
    let wsMetadata: WebSocket;

    try {
      wsMetadata = new WebSocket(relay);
    } catch {
      EventService.loading.value = false;
      return;
    }

    EventService.wsError(wsMetadata);
    EventService.wsOpen(wsMetadata, relay, authors, 0);
    EventService.wsMessage(wsMetadata, relay, EventService.fillMetadata);
    // EventService.wsClose(wsMetadata);
  };

  static getEvents(pubkey: string[]): void {
    const relays = EventService.getRelays();

    if (!relays.length) {
      console.error('No Relay address registered.');
      return;
    }

    EventService.loading.value = true;
    EventService.textNotes = [];
    EventService.users = [];

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
    const { profile } = storeToRefs(EventService.settingsStore);
    if (messageData != null) {
      const metadata = EventService.parseProfileMetadata(messageData.content);

      if (!metadata) {
        return;
      }

      profile.value = {
        ...metadata,
        ...{ pubkey: messageData.pubkey },
        relay,
      };
    } else {
      ws.close();
      EventService.loading.value = false;
    }
  };

  static initializeWsMyUser = (relay: string, authors: string[]) => {
    let wsMetadata: WebSocket;

    try {
      wsMetadata = new WebSocket(relay);
    } catch {
      EventService.loading.value = false;
      return;
    }

    EventService.wsError(wsMetadata);
    EventService.wsOpen(wsMetadata, relay, authors, 0);
    EventService.wsMessage(wsMetadata, relay, EventService.fillMyUser);
  };

  static async publishNote(content: string): Promise<PublishRelayResult[]> {
    const relays = EventService.getRelays();

    if (!relays.length) {
      console.error('No Relay address registered.');
      return [];
    }

    const event: EventTemplate<1> = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content,
    };
    const { relayResults, signedEvent } =
      await EventService.signAndPublish(event);
    const published = relayResults.some(result => result.status === 'accepted');

    if (published && signedEvent) {
      EventService.getEvents([]);
      EventService.addPublishedNote(
        signedEvent as TextNote,
        relayResults
          .filter(result => result.status === 'accepted')
          .map(result => result.relay),
      );
    }

    return relayResults;
  }

  static async publishProfile(
    metadata: ProfileMetadata,
  ): Promise<PublishRelayResult[]> {
    const event: EventTemplate<0> = {
      kind: 0,
      created_at: Math.floor(Date.now() / 1000),
      tags: [],
      content: JSON.stringify(metadata),
    };
    const { relayResults, signedEvent } =
      await EventService.signAndPublish(event);
    const published = relayResults.some(result => result.status === 'accepted');

    if (published && signedEvent) {
      const { profile } = storeToRefs(EventService.settingsStore);
      profile.value = {
        ...profile.value,
        ...metadata,
        pubkey: signedEvent.pubkey,
      };
    }

    return relayResults;
  }

  static async uploadAvatar(file: File): Promise<BlossomBlobDescriptor> {
    const server = EventService.getBlossomServer();

    if (!server) {
      throw new Error('No Blossom server configured.');
    }

    const blobHash = await EventService.sha256Hex(file);
    const authorization = EventService.createBlossomAuthorization(
      'upload',
      blobHash,
      server,
    );

    if (!authorization) {
      throw new Error('Could not sign Blossom upload authorization.');
    }

    const response = await fetch(`${server}/upload`, {
      method: 'PUT',
      headers: {
        Authorization: `Nostr ${authorization}`,
        'Content-Type': file.type || 'application/octet-stream',
        'X-SHA-256': blobHash,
      },
      body: file,
    });

    if (!response.ok) {
      const reason = response.headers.get('X-Reason');
      throw new Error(reason ?? `Upload failed with HTTP ${response.status}.`);
    }

    const descriptor = EventService.parseBlobDescriptor(await response.json());

    if (!descriptor) {
      throw new Error('Blossom server returned an invalid upload response.');
    }

    return descriptor;
  }

  // static getMyUser(pubkey: string[]): void {
  //   //TODO static
  //   for (const relay of relays) {
  //     // EventService.initializeWsMyUser(relay, pubkey);
  //     EventService.initializeTextNote(relay, pubkey);
  //   }
  //   return;
  // }
}

export default EventService;
