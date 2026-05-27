<template>
  <card-post
    v-for="textNoteUser of textNotesUsers"
    :key="textNoteUser.textNote.id + textNoteUser.textNote.relay"
    :pubkey="textNoteUser.textNote?.pubkey as string"
    :moment="formatTimeDifference(textNoteUser.textNote.created_at)"
    :content="textNoteUser.textNote.content"
    :hashtags="
      textNoteUser.textNote.tags.filter(t => t[0] === 't').map(t => t[1])
    "
    :relay="textNoteUser.textNote.relay"
    :profile="textNoteUser.user"
    :like-count="textNoteUser.likeCount"
    :liked-by-me="Boolean(privateKeyHex) && textNoteUser.likedByMe"
    :can-like="Boolean(privateKeyHex)"
    :like-pending="isLikePending(textNoteUser.textNote)"
    @like="likePost(textNoteUser)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useEventStore } from '@/stores/eventStore';
import { useSettingsStore } from '@/stores/settingsStore';
import CardPost from '@/components/CardPost.vue';
import { formatTimeDifference } from '@/composables/formatTimeDifference';
import EventService from '@/services/EventService';
import type { TextNote } from '@/types/TextNote';
import type { TextNoteUser } from '@/types/TextNoteUser';

const eventStore = useEventStore();
const { textNotesUsers } = storeToRefs(eventStore);
const settingsStore = useSettingsStore();
const { privateKeyHex } = storeToRefs(settingsStore);
const likingPosts = ref<Set<string>>(new Set());

const postKey = (textNote: TextNote): string => `${textNote.id}:${textNote.relay}`;

const isLikePending = (textNote: TextNote): boolean =>
  likingPosts.value.has(postKey(textNote));

const setLikePending = (textNote: TextNote, pending: boolean): void => {
  const next = new Set(likingPosts.value);

  if (pending) {
    next.add(postKey(textNote));
  } else {
    next.delete(postKey(textNote));
  }

  likingPosts.value = next;
};

const likePost = async (textNoteUser: TextNoteUser): Promise<void> => {
  if (
    !privateKeyHex.value ||
    textNoteUser.likedByMe ||
    isLikePending(textNoteUser.textNote)
  ) {
    return;
  }

  setLikePending(textNoteUser.textNote, true);

  try {
    await EventService.publishLike(textNoteUser.textNote);
  } finally {
    setLikePending(textNoteUser.textNote, false);
  }
};
</script>

<style scoped></style>
