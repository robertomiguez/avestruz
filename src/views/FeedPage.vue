<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title
          @click="cleanSelectedProfile()"
          slot="start"
          style="cursor: pointer"
          >Avestruz</ion-title
        >
        <button-login slot="end" />
        <span
          slot="end"
          style="margin-right: 5px"
        >
          <user-avatar
            v-if="profile"
            :profile="profile as User"
        /></span>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Feed</ion-title>
        </ion-toolbar>
      </ion-header>
      <card-profile
        v-if="selectedProfile"
        :profile="selectedProfile as User"
        :publicKeyHex="publicKeyHex as string"
      />
      <list-post />
      <ion-spinner
        v-show="loading"
        name="circles"
      ></ion-spinner>
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
  IonSpinner,
} from '@ionic/vue';
import ButtonLogin from '@/components/ButtonLogin.vue';
import ListPost from '@/components/ListPost.vue';
import CardProfile from '@/components/CardProfile.vue';

import { onMounted, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useUtilStore } from '@/stores/utilStore';
import { useSettingsStore } from '@/stores/settingsStore';
import EventService from '@/services/EventService';
import UserAvatar from '@/components/UserAvatar.vue';

import type { User } from '@/types/User';

const utilStore = useUtilStore();
const { selectedProfile, loading } = storeToRefs(utilStore);

const settingsStore = useSettingsStore();
const { publicKeyHex, profile } = storeToRefs(settingsStore);

watchEffect(() => {
  // getting info about metadata and text notes.
  EventService.getEvents(
    selectedProfile.value?.pubkey
      ? [selectedProfile.value?.pubkey as string]
      : [],
  );
});

const cleanSelectedProfile = () => {
  selectedProfile.value = undefined;
};

onMounted(() => {
  if (!publicKeyHex.value) {
    console.warn('not logged');
    return;
  }
});
</script>

<style scoped>
ion-spinner {
  top: 3%;
  left: 50%;
  position: relative;
  transform: translate(-50%, -50%);
}
</style>
