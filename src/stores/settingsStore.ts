import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore(
  'settingsStore',
  () => {
    const privateKeyNsec = ref<string>();
    const privateKeyHex = ref<string>();
    const publicKeyNpub = ref<string>();
    const publicKeyHex = ref<string>();
    const loading = ref<boolean>(false);
    return {
      privateKeyNsec,
      privateKeyHex,
      publicKeyNpub,
      publicKeyHex,
      loading,
    };
  },
  { persist: true },
);
