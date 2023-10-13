import type { Nip05 } from '@/types/Nip05';
import { splitEmailAddress } from '@/composables/emailUtils';

class NipService {
  static async getNip05(email: string, pubkey: string): Promise<Nip05> {
    try {
      const { localPart, domain } = splitEmailAddress(email);
      if (!localPart || !domain) return { names: {} };
      const url = `https://${domain}/.well-known/nostr.json?name=${localPart}`;
      const res = await fetch(url, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
      const data = await res.json();
      if (
        data.names[localPart] !== undefined &&
        data.names[localPart] === pubkey
      ) {
        data['checked'] = true;
      }
      return data;
    } catch (error) {
      console.error(error);
      return { names: {} };
    }
  }

  static async isVerified(
    email: string,
    pubkey: string,
  ): Promise<boolean | undefined> {
    const wellKnow = await NipService.getNip05(email, pubkey);
    return wellKnow?.checked;
  }
}

export default NipService;
