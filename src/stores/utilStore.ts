import { defineStore } from 'pinia';
import { ref } from 'vue';
import { User } from '@/types/User';

export const useUtilStore = defineStore(
  'utilStore',
  () => {
    const loading = ref<boolean>(false);
    const selectedProfile = ref<User>();

    return {
      loading,
      selectedProfile,
    };
  },
  { persist: true },
);
