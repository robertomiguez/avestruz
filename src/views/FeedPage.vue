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
            <h1>{{ feedTitle }}</h1>
            <p class="summary">{{ feedSummary }}</p>

            <ion-segment
              v-if="!selectedProfile"
              :value="feedMode"
              class="feed-mode"
              @ionChange="setFeedMode"
            >
              <ion-segment-button value="latest">
                <ion-label>Latest</ion-label>
              </ion-segment-button>
              <ion-segment-button
                value="liked"
                :disabled="!publicKeyHex"
              >
                <ion-label>Liked</ion-label>
              </ion-segment-button>
              <ion-segment-button
                value="replies"
                :disabled="!publicKeyHex"
              >
                <ion-label>My replies</ion-label>
              </ion-segment-button>
              <ion-segment-button
                value="repliesToMe"
                :disabled="!publicKeyHex"
              >
                <ion-label>To me</ion-label>
              </ion-segment-button>
            </ion-segment>
          </section>

          <card-profile
            v-if="selectedProfile"
            :profile="selectedProfile as User"
            :publicKeyHex="publicKeyHex as string"
          />
          <publish-note v-else-if="feedMode === 'latest'" />

          <div class="feed-list">
            <list-post />
          </div>

          <div
            v-if="showEmptyState"
            class="empty-state"
          >
            {{ emptyStateMessage }}
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
  IonSegment,
  IonSegmentButton,
  IonLabel,
} from '@ionic/vue';
import ButtonLogin from '@/components/ButtonLogin.vue';
import ListPost from '@/components/ListPost.vue';
import CardProfile from '@/components/CardProfile.vue';

import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useUtilStore } from '@/stores/utilStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useEventStore } from '@/stores/eventStore';
import EventService from '@/services/EventService';
import PublishNote from '@/components/PublishNote.vue';

import type { User } from '@/types/User';

type FeedMode = 'latest' | 'liked' | 'replies' | 'repliesToMe';

const utilStore = useUtilStore();
const { selectedProfile, loading } = storeToRefs(utilStore);

const settingsStore = useSettingsStore();
const { publicKeyHex } = storeToRefs(settingsStore);

const eventStore = useEventStore();
const { textNotesUsers } = storeToRefs(eventStore);

const feedMode = ref<FeedMode>('latest');
const signedInFeedModes: FeedMode[] = ['liked', 'replies', 'repliesToMe'];

const isFeedMode = (value: unknown): value is FeedMode =>
  value === 'latest' || signedInFeedModes.includes(value as FeedMode);

const feedTitle = computed(() => {
  if (selectedProfile.value) {
    return 'Profile notes';
  }

  if (feedMode.value === 'liked') {
    return 'Liked notes';
  }

  if (feedMode.value === 'replies') {
    return 'My replies';
  }

  if (feedMode.value === 'repliesToMe') {
    return 'Replies to me';
  }

  return 'Latest notes';
});

const feedSummary = computed(() => {
  if (selectedProfile.value) {
    return 'Showing notes from the selected public key.';
  }

  if (feedMode.value === 'liked') {
    return 'Notes liked by your public key.';
  }

  if (feedMode.value === 'replies') {
    return 'Comments you published in reply to other notes.';
  }

  if (feedMode.value === 'repliesToMe') {
    return 'Comments from other people that reference your public key.';
  }

  return 'A lightweight stream from your configured relays.';
});

const showEmptyState = computed(
  () => !loading.value && textNotesUsers.value.length === 0,
);

const emptyStateMessage = computed(() => {
  if (selectedProfile.value) {
    return 'No notes found for this profile.';
  }

  if (feedMode.value === 'liked') {
    return publicKeyHex.value
      ? 'No liked notes yet.'
      : 'Sign in to see liked notes.';
  }

  if (feedMode.value === 'replies') {
    return publicKeyHex.value
      ? 'No replies found yet.'
      : 'Sign in to see your replies.';
  }

  if (feedMode.value === 'repliesToMe') {
    return publicKeyHex.value
      ? 'No replies to you found yet.'
      : 'Sign in to see replies to you.';
  }

  return 'No notes found.';
});

const setFeedMode = (event: CustomEvent): void => {
  const value = event.detail.value;

  if (!isFeedMode(value)) {
    return;
  }

  if (value !== 'latest' && !publicKeyHex.value) {
    return;
  }

  feedMode.value = value;
};

watch(publicKeyHex, value => {
  if (!value && feedMode.value !== 'latest') {
    feedMode.value = 'latest';
  }
});

watch([selectedProfile, feedMode, publicKeyHex], () => {
  if (selectedProfile.value?.pubkey) {
    EventService.getEvents([selectedProfile.value.pubkey]);
    return;
  }

  if (feedMode.value === 'liked') {
    void EventService.getLikedNotes(publicKeyHex.value ?? '');
    return;
  }

  if (feedMode.value === 'replies') {
    void EventService.getMyReplies(publicKeyHex.value ?? '');
    return;
  }

  if (feedMode.value === 'repliesToMe') {
    void EventService.getRepliesToMe(publicKeyHex.value ?? '');
    return;
  }

  EventService.getEvents([]);
}, {
  immediate: true,
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

.feed-mode {
  width: min(100%, 460px);
  margin-top: 14px;
}

.feed-list {
  display: grid;
  gap: 12px;
}

.empty-state {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  background: #ffffff;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
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
