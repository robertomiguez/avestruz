import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useUtilStore = defineStore(
  'utilStore',
  () => {
    const loading = ref<boolean>(false);
    const userSelected = ref<string>();
    return {
      loading,
      userSelected,
    };
  },
  { persist: true },
);
