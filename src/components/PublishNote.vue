<template>
  <section class="composer-card">
    <ion-textarea
      v-model="note"
      :auto-grow="true"
      placeholder="Write a note to your relays..."
      class="composer-input"
    ></ion-textarea>

    <div class="composer-footer">
      <span class="composer-hint">
        {{ statusMessage }}
      </span>
      <ion-button
        size="small"
        :disabled="!canPublish || !note?.trim() || publishing"
        @click="publish"
      >
        {{ publishing ? 'Publishing' : 'Publish' }}
      </ion-button>
    </div>

    <div
      v-if="relayResults.length"
      class="relay-results"
    >
      <div
        v-for="result in relayResults"
        :key="result.relay"
        class="relay-result"
        :class="result.status"
      >
        <span class="relay-status-dot"></span>
        <span
          class="relay-url"
          :title="result.relay"
        >
          {{ result.relay }}
        </span>
        <span class="relay-status-label">{{ statusLabel(result.status) }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { IonTextarea, IonButton } from '@ionic/vue';
import EventService, { PublishRelayResult } from '@/services/EventService';
import { useSettingsStore } from '@/stores/settingsStore';

type RelayPublishStatus = PublishRelayResult['status'] | 'pending';
type RelayPublishResult = {
  relay: string;
  status: RelayPublishStatus;
  message?: string;
};

const note = ref<string>();
const publishing = ref(false);
const publishStatus = ref<string>();
const relayResults = ref<RelayPublishResult[]>([]);
const settingsStore = useSettingsStore();
const { privateKeyHex } = storeToRefs(settingsStore);

const canPublish = computed(() => Boolean(privateKeyHex.value));
const statusMessage = computed(
  () =>
    publishStatus.value ??
    (canPublish.value
      ? 'Ready to sign and publish.'
      : 'Sign in with an nsec to publish.'),
);

const statusLabel = (status: RelayPublishStatus) => {
  if (status === 'accepted') {
    return 'Accepted';
  }

  if (status === 'failed') {
    return 'Failed';
  }

  return 'Pending';
};

const publish = async () => {
  const content = note.value?.trim();

  if (!content || !canPublish.value || publishing.value) {
    return;
  }

  publishing.value = true;
  publishStatus.value = 'Signing and publishing to relays...';
  relayResults.value = EventService.getRelays().map(relay => ({
    relay,
    status: 'pending',
  }));

  const results = await EventService.publishNote(content);
  const accepted = results.filter(result => result.status === 'accepted').length;

  publishing.value = false;
  relayResults.value = results;
  if (accepted) {
    note.value = undefined;
    publishStatus.value = `Published to ${accepted} of ${results.length} relays.`;
    return;
  }

  publishStatus.value = 'Publish failed. Check your relays and try again.';
};
</script>

<style scoped>
.composer-card {
  display: grid;
  gap: 12px;
  width: 100%;
  margin: 0 auto 12px;
  padding: 16px;
  border: 1px solid #bfdbfe;
  border-top: 4px solid #3880ff;
  border-radius: 10px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
}

.composer-input {
  --background: #eff6ff;
  --border-radius: 8px;
  --color: #111827;
  --padding-bottom: 12px;
  --padding-end: 12px;
  --padding-start: 12px;
  --padding-top: 12px;
  min-height: 92px;
}

.composer-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.composer-hint {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
}

.relay-results {
  display: grid;
  gap: 6px;
  padding: 10px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #ffffff;
}

.relay-result {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  color: #6b7280;
  font-size: 12px;
}

.relay-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #94a3b8;
}

.relay-result.accepted .relay-status-dot {
  background: #2dd36f;
}

.relay-result.failed .relay-status-dot {
  background: #eb445a;
}

.relay-url {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.relay-status-label {
  color: #111827;
  font-weight: 700;
}

@media (max-width: 430px) {
  .composer-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
