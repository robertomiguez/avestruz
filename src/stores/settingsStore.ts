import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '@/types/User';

export const useSettingsStore = defineStore(
  'settingsStore',
  () => {
    const privateKeyNsec = ref<string>();
    const privateKeyHex = ref<string>();
    const publicKeyNpub = ref<string>();
    const publicKeyHex = ref<string>();
    const profile = ref<User>();
    return {
      privateKeyNsec,
      privateKeyHex,
      publicKeyNpub,
      publicKeyHex,
      profile,
    };
  },
  { persist: true },
);
