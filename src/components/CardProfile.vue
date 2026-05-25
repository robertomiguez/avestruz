<template>
  <section class="profile-card">
    <div class="profile-banner">
      <img
        v-if="profile.banner"
        :src="profile.banner"
        alt=""
      />
    </div>

    <div class="profile-body">
      <user-avatar
        cssAssigned="profile"
        :profile="profile as User"
        class="profile-avatar"
      />

      <div class="profile-heading">
        <h2>{{ displayName }}</h2>
        <div class="profile-actions">
          <ion-icon
            v-show="profile?.checked"
            :icon="personCircleOutline"
            class="verified-icon"
            aria-label="Verified NIP-05"
          ></ion-icon>
          <ion-button
            v-show="props.publicKeyHex === props.profile.pubkey"
            fill="clear"
            size="small"
            class="refresh-button"
            aria-label="Refresh profile"
            @click="updateMyProfile"
          >
            <ion-icon
              slot="icon-only"
              :icon="refreshCircleOutline"
            ></ion-icon>
          </ion-button>
        </div>
      </div>

      <p
        v-if="profile?.nip05"
        class="nip05"
      >
        {{ profile.nip05 }}
      </p>
      <p
        class="pubkey"
        :title="profile.pubkey"
      >
        {{ shortPubkey }}
      </p>
      <p
        v-if="profile.about"
        class="about"
      >
        {{ profile.about }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import UserAvatar from '@/components/UserAvatar.vue';
import EventService from '@/services/EventService';
import type { User } from '@/types/User';
import { IonButton, IonIcon } from '@ionic/vue';
import { personCircleOutline, refreshCircleOutline } from 'ionicons/icons';
import { truncate } from '@/composables/truncate';

const props = defineProps<{
  profile: User;
  publicKeyHex: string;
}>();

const displayName = computed(
  () => props.profile.name || props.profile.display_name || 'Anon',
);
const shortPubkey = computed(() => truncate(props.profile.pubkey, 34));

const updateMyProfile = () => {
  const relays = EventService.getRelays();

  if (props.publicKeyHex === props.profile.pubkey) {
    for (const relay of relays) {
      EventService.initializeWsMyUser(relay, [props.profile.pubkey]);
    }
  }
};
</script>

<style scoped>
.profile-card {
  overflow: hidden;
  width: 100%;
  margin: 0 auto 12px;
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  background: #fbfdff;
}

.profile-banner {
  height: 130px;
  background: linear-gradient(135deg, #3880ff, #3dc2ff 55%, #5260ff);
}

.profile-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-body {
  padding: 0 18px 20px;
}

.profile-avatar {
  margin-top: -54px;
}

.profile-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

h2 {
  min-width: 0;
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 800;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.profile-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
}

.verified-icon {
  color: #2563eb;
  font-size: 20px;
}

.refresh-button {
  --color: #3880ff;
  --padding-end: 4px;
  --padding-start: 4px;
}

.nip05,
.pubkey,
.about {
  margin: 8px 0 0;
  line-height: 1.5;
}

.nip05,
.pubkey {
  color: #6b7280;
  font-size: 12px;
  overflow-wrap: anywhere;
}

.about {
  color: #374151;
  font-size: 14px;
}
</style>
