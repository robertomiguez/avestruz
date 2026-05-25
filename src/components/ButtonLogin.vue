<template>
  <div
    v-if="publicKeyNpub"
    class="account-chip"
  >
    <span class="account-status">
      <img
        class="account-avatar"
        :src="accountAvatarSrc"
        alt=""
        @error="useAvatarFallback"
      />
      <button
        class="account-label"
        type="button"
        @click="login"
      >
        {{ accountLabel }}
      </button>
    </span>
    <ion-button
      fill="clear"
      size="small"
      class="logout-button"
      @click="logout"
    >
      Logout
    </ion-button>
  </div>

  <ion-button
    v-else
    size="small"
    class="button-login"
    @click="login"
  >
    Login
  </ion-button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import router from '@/router';
import { IonButton } from '@ionic/vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { storeToRefs } from 'pinia';
import { truncate } from '@/composables/truncate';

const settingsStore = useSettingsStore();
const { privateKeyNsec, privateKeyHex, publicKeyNpub, publicKeyHex, profile } =
  storeToRefs(settingsStore);
const fallbackAvatarSrc = 'oistrich-64.png';

const accountLabel = computed(() => {
  const name = profile.value?.name ?? profile.value?.display_name;

  if (name) {
    return truncate(name, 16);
  }

  return publicKeyNpub.value
    ? `${publicKeyNpub.value.slice(0, 8)}...${publicKeyNpub.value.slice(-4)}`
    : 'Signed in';
});
const accountAvatarSrc = computed(
  () =>
    profile.value?.picture ||
    `${import.meta.env.VITE_DEFAULT_IMAGE}${publicKeyHex.value ?? 'anon'}`,
);

const blurActiveElement = () => {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
};

const login = () => {
  blurActiveElement();
  router.push({ name: 'LoginPage' });
};

const useAvatarFallback = (event: Event) => {
  const image = event.target as HTMLImageElement;
  image.src = fallbackAvatarSrc;
};

const logout = () => {
  privateKeyNsec.value = undefined;
  privateKeyHex.value = undefined;
  publicKeyNpub.value = undefined;
  publicKeyHex.value = undefined;
  profile.value = undefined;
};
</script>

<style scoped>
.button-login {
  --background: #ffffff;
  --background-hover: #eff6ff;
  --border-color: #3880ff;
  --border-radius: 999px;
  --border-style: solid;
  --border-width: 1px;
  --color: #2563eb;
  --padding-end: 16px;
  --padding-start: 16px;
  margin-inline-end: 8px;
  font-weight: 700;
}

.account-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  max-width: min(280px, calc(100vw - 150px));
  margin-inline-end: 8px;
  padding: 3px;
  border: 1px solid #93c5fd;
  border-radius: 999px;
  background: #ffffff;
  color: #111827;
}

.account-status {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  padding-inline-start: 8px;
}

.account-avatar {
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  object-fit: cover;
}

.account-label {
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #111827;
  cursor: pointer;
  overflow: hidden;
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-label:hover,
.account-label:focus-visible {
  color: #2563eb;
  outline: none;
}

.logout-button {
  --border-color: #93c5fd;
  --border-radius: 999px;
  --border-style: solid;
  --border-width: 1px;
  --color: #2563eb;
  --background-hover: #eff6ff;
  --padding-end: 8px;
  --padding-start: 8px;
  min-height: 28px;
  font-size: 12px;
}

@media (max-width: 520px) {
  .account-chip {
    max-width: calc(100vw - 132px);
  }

  .account-label {
    max-width: 54px;
  }
}

@media (max-width: 390px) {
  .account-label {
    max-width: 0;
  }

  .account-status {
    gap: 0;
    padding-inline-start: 7px;
  }
}
</style>
