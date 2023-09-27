import { defineStore } from 'pinia';
import { TextNoteUser } from '@/types/TextNoteUser';
import { ref } from 'vue';

export const useEventStore = defineStore('eventStore', () => {
  const textNotesUsers = ref<TextNoteUser[]>([]);

  return {
    textNotesUsers,
  };
});
