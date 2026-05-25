<template>
  <ion-page>
    <ion-header translucent>
      <ion-toolbar>
        <ion-title>{{ publicKeyNpub ? 'Account' : 'Login' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <main class="login-shell">
        <section
          v-if="publicKeyNpub"
          class="login-card"
        >
          <div class="login-heading">
            <p class="eyebrow">
              {{ createdNewKey ? 'Save this key' : 'Account keys' }}
            </p>
            <h1>{{ createdNewKey ? 'Back up your new account' : 'Signed in' }}</h1>
            <p>
              Your public key can be shared. Your private key is the only way to
              restore this account, and should never be shared.
            </p>
          </div>

          <div
            v-if="createdNewKey"
            class="warning-panel"
          >
            Save your private key before leaving this screen.
          </div>

          <div class="profile-form">
            <ion-item class="profile-field">
              <ion-input
                label="Name"
                labelPlacement="stacked"
                placeholder="Avestruz"
                v-model="profileName"
              ></ion-input>
            </ion-item>

            <ion-item class="profile-field">
              <ion-input
                label="Avatar URL"
                labelPlacement="stacked"
                type="url"
                placeholder="https://..."
                v-model="profilePicture"
              ></ion-input>
            </ion-item>

            <div class="avatar-preview">
              <img
                :src="avatarPreviewSrc"
                alt=""
                @error="useAvatarFallback"
              />
            </div>

            <input
              ref="avatarInput"
              class="avatar-file-input"
              type="file"
              accept="image/*"
              @change="uploadAvatar"
            />

            <div class="avatar-upload-row">
              <ion-button
                fill="outline"
                size="small"
                :disabled="avatarUploadDisabled"
                @click="chooseAvatar"
              >
                {{ uploadingAvatar ? 'Uploading' : 'Upload image' }}
              </ion-button>
              <span class="profile-status">{{ avatarStatusMessage }}</span>
            </div>

            <span
              v-if="profileStatus"
              class="profile-status"
            >
              {{ profileStatus }}
            </span>

            <div
              v-if="profileRelayResults.length"
              class="relay-results"
            >
              <div
                v-for="result in profileRelayResults"
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
                <span class="relay-status-label">
                  {{ statusLabel(result.status) }}
                </span>
              </div>
            </div>
          </div>

          <div class="key-list">
            <div class="key-row">
              <div class="key-copy">
                <span class="key-label">Public key</span>
                <code>{{ publicKeyNpub }}</code>
              </div>
              <ion-button
                fill="outline"
                size="small"
                @click="copyKey(publicKeyNpub)"
              >
                Copy
              </ion-button>
            </div>

            <div class="key-row private-row">
              <div class="key-copy">
                <span class="key-label">Private key</span>
                <code>{{ showPrivateKey ? privateKeyNsec : maskedPrivateKey }}</code>
              </div>
              <div class="key-actions">
                <ion-button
                  fill="outline"
                  size="small"
                  @click="showPrivateKey = !showPrivateKey"
                >
                  {{ showPrivateKey ? 'Hide' : 'Reveal' }}
                </ion-button>
                <ion-button
                  fill="outline"
                  size="small"
                  :disabled="!showPrivateKey"
                  @click="copyKey(privateKeyNsec)"
                >
                  Copy
                </ion-button>
              </div>
            </div>
          </div>

          <div class="login-actions account-actions">
            <ion-button
              :disabled="!privateKeyHex || savingProfile"
              @click="saveProfileAndBack"
            >
              {{ savingProfile ? 'Saving' : 'Save profile' }}
            </ion-button>
            <ion-button
              fill="outline"
              @click="back"
            >
              Cancel
            </ion-button>
            <ion-button
              fill="outline"
              @click="logout"
            >
              Logout
            </ion-button>
          </div>
        </section>

        <section
          v-else
          class="login-card"
        >
          <div class="login-heading">
            <p class="eyebrow">Local key</p>
            <h1>Sign in to publish</h1>
            <p>
              Use your private `nsec` key to sign in. The public key is derived
              automatically.
            </p>
          </div>

          <ion-item class="key-field">
            <ion-input
              label="Private key"
              labelPlacement="stacked"
              type="password"
              placeholder="nsec..."
              v-model="privateKeyNsec"
            ></ion-input>
          </ion-item>

          <div class="login-actions">
            <ion-button @click="login">Login</ion-button>
            <ion-button
              fill="outline"
              @click="join"
            >
              Join
            </ion-button>
            <ion-button
              fill="clear"
              @click="back"
            >
              Back
            </ion-button>
          </div>
        </section>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { nip19, getPublicKey, generatePrivateKey } from 'nostr-tools';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonItem,
  IonButton,
} from '@ionic/vue';
import router from '@/router';
import EventService, {
  type ProfileMetadata,
  type PublishRelayResult,
} from '@/services/EventService';
import { storeToRefs } from 'pinia';
import { useSettingsStore } from '@/stores/settingsStore';

type RelayPublishStatus = PublishRelayResult['status'] | 'pending';
type RelayPublishResult = {
  relay: string;
  status: RelayPublishStatus;
  message?: string;
};

const settingsStore = useSettingsStore();
const { privateKeyNsec, privateKeyHex, publicKeyNpub, publicKeyHex, profile } =
  storeToRefs(settingsStore);
const createdNewKey = ref(false);
const showPrivateKey = ref(false);
const profileName = ref('');
const profilePicture = ref('');
const avatarInput = ref<HTMLInputElement>();
const uploadingAvatar = ref(false);
const avatarStatus = ref<string>();
const savingProfile = ref(false);
const profileStatus = ref<string>();
const profileRelayResults = ref<RelayPublishResult[]>([]);
const fallbackAvatarSrc = 'oistrich-64.png';

const maskedPrivateKey = computed(() =>
  privateKeyNsec.value ? `${privateKeyNsec.value.slice(0, 8)}...hidden` : '',
);
const avatarPreviewSrc = computed(
  () =>
    profilePicture.value ||
    `${import.meta.env.VITE_DEFAULT_IMAGE}${publicKeyHex.value ?? 'anon'}`,
);
const avatarUploadDisabled = computed(
  () =>
    !privateKeyHex.value ||
    uploadingAvatar.value ||
    !EventService.getBlossomServer(),
);
const avatarStatusMessage = computed(
  () =>
    avatarStatus.value ??
    (!EventService.getBlossomServer()
      ? 'Set VITE_BLOSSOM_SERVER to upload images.'
      : undefined),
);

watch(
  profile,
  () => {
    profileName.value = profile.value?.display_name ?? profile.value?.name ?? '';
    profilePicture.value = profile.value?.picture ?? '';
  },
  { immediate: true },
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

const blurActiveElement = () => {
  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement) {
    activeElement.blur();
  }
};

const initializeMyUser = () => {
  const relays = EventService.getRelays();

  for (const relay of relays) {
    EventService.initializeWsMyUser(relay, [publicKeyHex.value as string]);
  }
};

const setKeysFromNsec = () => {
  if (privateKeyNsec.value?.slice(0, 4) !== 'nsec') {
    throw new Error('invalid private key (nsec)');
  }

  const { data: prHex } = nip19.decode(privateKeyNsec.value);
  privateKeyHex.value = prHex as string;
  publicKeyHex.value = getPublicKey(privateKeyHex.value);
  publicKeyNpub.value = nip19.npubEncode(publicKeyHex.value);
  initializeMyUser();
};

const join = () => {
  const sk = generatePrivateKey();
  privateKeyNsec.value = nip19.nsecEncode(sk);
  setKeysFromNsec();
  createdNewKey.value = true;
  showPrivateKey.value = true;
};

const login = () => {
  try {
    setKeysFromNsec();
    createdNewKey.value = false;
    showPrivateKey.value = false;
    back();
  } catch (error) {
    privateKeyNsec.value = undefined;
    console.error('invalid private key (nsec)');
  }
};

const logout = () => {
  privateKeyNsec.value = undefined;
  privateKeyHex.value = undefined;
  publicKeyNpub.value = undefined;
  publicKeyHex.value = undefined;
  profile.value = undefined;
  createdNewKey.value = false;
  showPrivateKey.value = false;
};

const copyKey = async (value?: string) => {
  if (!value) {
    return;
  }

  await navigator.clipboard.writeText(value);
};

const chooseAvatar = () => {
  avatarInput.value?.click();
};

const useAvatarFallback = (event: Event) => {
  const image = event.target as HTMLImageElement;
  image.src = fallbackAvatarSrc;
};

const saveProfile = async (): Promise<boolean> => {
  if (!privateKeyHex.value || savingProfile.value) {
    return false;
  }

  const name = profileName.value.trim();
  const picture = profilePicture.value.trim();
  const metadata: ProfileMetadata = {
    about: profile.value?.about,
    banner: profile.value?.banner,
    website: profile.value?.website,
    nip05: profile.value?.nip05,
    name,
    display_name: name,
    picture,
  };

  savingProfile.value = true;
  profileStatus.value = 'Saving profile to relays...';
  profileRelayResults.value = EventService.getRelays().map(relay => ({
    relay,
    status: 'pending',
  }));

  const results = await EventService.publishProfile(metadata);
  const accepted = results.filter(result => result.status === 'accepted').length;

  savingProfile.value = false;
  profileRelayResults.value = results;
  profileStatus.value = accepted
    ? `Saved to ${accepted} of ${results.length} relays.`
    : 'Profile save failed. Check your relays and try again.';

  return Boolean(accepted);
};

const saveProfileAndBack = async () => {
  if (await saveProfile()) {
    back();
  }
};

const uploadAvatar = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file || uploadingAvatar.value) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    avatarStatus.value = 'Choose an image file.';
    input.value = '';
    return;
  }

  uploadingAvatar.value = true;
  avatarStatus.value = 'Uploading avatar...';

  try {
    const descriptor = await EventService.uploadAvatar(file);
    profilePicture.value = descriptor.url;
    avatarStatus.value = 'Avatar uploaded. Saving profile...';
    avatarStatus.value = (await saveProfile())
      ? 'Avatar uploaded and saved.'
      : 'Avatar uploaded. Profile save failed.';
  } catch (error) {
    avatarStatus.value =
      error instanceof Error ? error.message : 'Avatar upload failed.';
  } finally {
    uploadingAvatar.value = false;
    input.value = '';
  }
};

const back = () => {
  blurActiveElement();
  router.push({ name: 'FeedPage' });
};
</script>

<style scoped>
.login-shell {
  display: grid;
  min-height: 100%;
  place-items: start center;
  padding: 48px 18px;
  background: #f4f5f8;
}

.login-card {
  display: grid;
  box-sizing: border-box;
  gap: 18px;
  width: min(100%, 520px);
  min-width: 0;
  padding: 22px;
  border: 1px solid #dbe3ec;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 0 0 6px #ffffff,
    0 0 0 7px #e6ecf0,
    0 16px 40px rgba(17, 24, 39, 0.08);
}

.login-heading {
  display: grid;
  gap: 8px;
}

.eyebrow {
  margin: 0;
  color: #3880ff;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: #111827;
  font-size: 24px;
  font-weight: 800;
  line-height: 1.25;
}

p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
}

.warning-panel {
  padding: 12px;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  background: #fffbeb;
  color: #92400e;
  font-size: 13px;
  font-weight: 700;
}

.key-field {
  --background: #f9fafb;
  --color: #111827;
  --border-radius: 8px;
  --inner-border-width: 0;
}

.profile-form {
  display: grid;
  gap: 10px;
}

.profile-field {
  --background: #f9fafb;
  --color: #111827;
  --border-radius: 8px;
  --inner-border-width: 0;
}

.key-field ion-input,
.profile-field ion-input {
  --color: #111827;
  --highlight-color-focused: #3880ff;
  --placeholder-color: #6b7280;
  --placeholder-opacity: 1;
}

.avatar-preview {
  display: flex;
  justify-content: center;
}

.avatar-preview img {
  width: 88px;
  height: 88px;
  border: 4px solid #ffffff;
  border-radius: 999px;
  background: #eff6ff;
  box-shadow: 0 0 0 1px #bfdbfe;
  object-fit: cover;
}

.avatar-file-input {
  display: none;
}

.avatar-upload-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 10px;
  align-items: center;
}

.profile-status {
  min-height: 18px;
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
}

.relay-results {
  display: grid;
  gap: 6px;
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

.key-list {
  display: grid;
  gap: 10px;
}

.key-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 12px;
  border: 1px solid #dbe3ec;
  border-radius: 10px;
  background: #f8fbff;
}

.private-row {
  border-color: #bfdbfe;
  background: #eff6ff;
}

.key-copy {
  display: grid;
  min-width: 0;
  gap: 4px;
}

.key-label {
  color: #6b7280;
  font-size: 12px;
  font-weight: 700;
}

code {
  display: block;
  max-width: 100%;
  padding: 10px;
  border: 1px solid #dbe3ec;
  border-radius: 8px;
  background: #ffffff;
  color: #111827;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.45;
  overflow-wrap: anywhere;
  white-space: normal;
  word-break: break-word;
}

.key-actions,
.login-actions {
  display: grid;
  gap: 8px;
  align-items: center;
}

.key-actions {
  grid-template-columns: auto auto;
}

.login-actions {
  grid-template-columns: 1fr 1fr auto;
}

.account-actions {
  grid-template-columns: 1fr 1fr auto;
}

@media (max-width: 520px) {
  .login-shell {
    padding: 20px 12px 32px;
  }

  .login-card {
    gap: 14px;
    width: 100%;
    padding: 16px;
    box-shadow: none;
  }

  .key-row,
  .avatar-upload-row,
  .login-actions,
  .account-actions {
    grid-template-columns: 1fr;
  }

  .key-actions {
    grid-template-columns: 1fr 1fr;
  }

  h1 {
    font-size: 22px;
  }

  code {
    font-size: 11px;
  }
}
</style>
