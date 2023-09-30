<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title
          @click="cleanSelectedUser()"
          slot="start"
          style="cursor: pointer"
          >Avestruz</ion-title
        >
        <button-login slot="end" />
        <image-user
          v-show="profile?.pubkey"
          :pubkey="profile?.pubkey ?? ''"
          :picture="profile?.picture"
          slot="end"
        />
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Feed</ion-title>
        </ion-toolbar>
      </ion-header>
      <!-- <card-profile :profile="" /> -->
      <list-post />
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
import ButtonLogin from '@/components/ButtonLogin.vue';
import ListPost from '@/components/ListPost.vue';
import ImageUser from '@/components/ImageUser.vue';
// import CardProfile from '@/components/CardProfile.vue';

import { watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useUtilStore } from '@/stores/utilStore';
import { useSettingsStore } from '@/stores/settingsStore';
import EventService from '@/services/EventService';

import type { User } from '@/types/User';

const utilStore = useUtilStore();
const { userSelected } = storeToRefs(utilStore);

const settingsStore = useSettingsStore();
const { publicKeyHex, profile } = storeToRefs(settingsStore);

watchEffect(async () => {
  // getting info about you.
  if (!publicKeyHex.value) {
    console.warn('not logged');
    return;
  }
  profile.value = (
    await EventService.getMetadatas([publicKeyHex.value as string])
  )[0] as User;
});

watchEffect(async () => {
  // getting info about metadata and text notes.
  await EventService.getEvents(
    userSelected.value ? [userSelected.value as string] : [],
  );
});

const cleanSelectedUser = () => {
  userSelected.value = undefined;
};
</script>

<style scoped></style>
