<template>
  <card-post
    v-for="textNoteUser of textNotesUsers"
    :key="textNoteUser.textNote.id"
    :pubkey="textNoteUser.textNote?.pubkey as string"
    :displayName="
      JSON.stringify(textNoteUser.user) === '{}'
        ? textNoteUser.textNote?.pubkey // user not found in relay
        : textNoteUser.user?.display_name ?? textNoteUser.user?.name ?? 'Anon'
    "
    :picture="textNoteUser.user?.picture as string"
    :moment="
      formatDistance(
        fromUnixTime(textNoteUser.textNote.created_at),
        Date.now(),
        { addSuffix: true },
      )
    "
    :content="textNoteUser.textNote.content"
    :hashtags="
      textNoteUser.textNote.tags.filter(t => t[0] === 't').map(t => t[1])
    "
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useEventStore } from '@/stores/eventStore';
import { fromUnixTime, formatDistance } from 'date-fns';
import CardPost from '@/components/CardPost.vue';

const eventStore = useEventStore();
const { textNotesUsers } = storeToRefs(eventStore);
</script>

<style scoped></style>
