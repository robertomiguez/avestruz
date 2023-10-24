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
    :profile="textNoteUser.user as User"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useEventStore } from '@/stores/eventStore';
import CardPost from '@/components/CardPost.vue';
import { User } from '@/types/User';
import { formatTimeDifference } from '@/composables/formatTimeDifference';

const eventStore = useEventStore();
const { textNotesUsers } = storeToRefs(eventStore);
</script>

<style scoped></style>
