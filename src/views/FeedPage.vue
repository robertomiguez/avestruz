<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button
            fill="clear"
            class="brand-button"
            @click="cleanSelectedProfile"
          >
            <span class="brand-mark">Avestruz</span>
          </ion-button>
        </ion-buttons>

        <ion-title>Feed</ion-title>

        <ion-buttons slot="end">
          <button-login />
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <div class="feed-canvas">
        <main class="feed-shell">
          <section class="feed-header">
            <p class="eyebrow">Nostr relay feed</p>
            <h1>{{ selectedProfile ? 'Profile notes' : 'Latest notes' }}</h1>
            <p class="summary">
              {{
                selectedProfile
                  ? 'Showing notes from the selected public key.'
                  : 'A lightweight stream from your configured relays.'
              }}
            </p>
          </section>

          <card-profile
            v-if="selectedProfile"
            :profile="selectedProfile as User"
            :publicKeyHex="publicKeyHex as string"
          />
          <publish-note v-else />

          <div class="feed-list">
            <list-post />
          </div>

          <div
            v-show="loading"
            class="loading-state"
          >
            <ion-spinner name="circles"></ion-spinner>
          </div>
        </main>
      </div>
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
  IonButtons,
  IonButton,
} from '@ionic/vue';
import ButtonLogin from '@/components/ButtonLogin.vue';
import ListPost from '@/components/ListPost.vue';
import CardProfile from '@/components/CardProfile.vue';

import { watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useUtilStore } from '@/stores/utilStore';
import { useSettingsStore } from '@/stores/settingsStore';
import EventService from '@/services/EventService';
import PublishNote from '@/components/PublishNote.vue';

import type { User } from '@/types/User';

const utilStore = useUtilStore();
const { selectedProfile, loading } = storeToRefs(utilStore);

const settingsStore = useSettingsStore();
const { publicKeyHex } = storeToRefs(settingsStore);

watchEffect(() => {
  EventService.getEvents(
    selectedProfile.value?.pubkey
      ? [selectedProfile.value?.pubkey as string]
      : [],
  );
});

const cleanSelectedProfile = () => {
  selectedProfile.value = undefined;
};
</script>

<style scoped>
ion-toolbar {
  --background: rgba(255, 255, 255, 0.96);
  --border-color: #dbe3ec;
}

.brand-button {
  --padding-start: 10px;
  --padding-end: 10px;
}

.brand-mark {
  color: #111827;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: 0;
}

.feed-canvas {
  min-height: 100%;
  background:
    linear-gradient(180deg, #dbeafe 0, #eff6ff 160px, #e0f2fe 100%);
}

.feed-shell {
  width: min(100%, 640px);
  margin: 0 auto;
  padding: 24px 16px 48px;
  border-inline: 1px solid #bfdbfe;
  background: rgba(248, 251, 255, 0.88);
  box-shadow: 0 0 32px rgba(37, 99, 235, 0.12);
}

.feed-header {
  margin-bottom: 12px;
  padding: 16px;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  background: linear-gradient(135deg, #ffffff, #eff6ff);
}

.eyebrow {
  margin: 0 0 6px;
  color: #3880ff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #111827;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
}

.summary {
  max-width: 34rem;
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 15px;
  line-height: 1.5;
}

.feed-list {
  display: grid;
  gap: 12px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

@media (max-width: 680px) {
  .feed-shell {
    border-inline: 0;
    box-shadow: none;
  }
}
</style>
