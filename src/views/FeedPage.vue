<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Avestruz</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Feed</ion-title>
        </ion-toolbar>
      </ion-header>
      <card-post
        v-for="textNoteUser of textNotesUsers"
        :key="textNoteUser.textNote.id"
        :displayName="
          textNoteUser.user?.notFound
            ? textNoteUser.user?.pubkey
            : textNoteUser.user?.display_name ??
              textNoteUser.user?.name ??
              'Anon'
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
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
} from '@ionic/vue';
import { fromUnixTime, formatDistance } from 'date-fns';
import EventService from '@/services/EventService';
import { TextNoteUser } from '@/types/TextNoteUser';
import { onMounted, ref } from 'vue';
import CardPost from '@/components/CardPost.vue';

const textNotesUsers = ref<TextNoteUser[]>([]);

onMounted(async () => {
  textNotesUsers.value = await EventService.getEvents();
});
</script>

<style scoped></style>
