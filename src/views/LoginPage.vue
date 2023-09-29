<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Login</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding ion-text-center">
      <ion-card class="card">
        <ion-item>
          <ion-input
            label="Your Key"
            labelPlacement="stacked"
            type="password"
            placeholder="nsec"
            v-model="privateKeyNsec"
          ></ion-input>
        </ion-item>
        <ion-button
          fill="outline"
          @click="login"
          style="margin-bottom: 20px"
          >Login</ion-button
        >
      </ion-card>
      <div style="margin-top: 20px">
        <ion-label>Don't have an account?</ion-label>
      </div>
      <div>
        <ion-grid>
          <ion-row>
            <ion-col>
              <ion-button
                fill="outline"
                @click="join"
                >Join</ion-button
              ></ion-col
            >
            <ion-col><ion-label>or</ion-label></ion-col>
            <ion-col
              ><ion-button
                fill="outline"
                @click="back"
                >back</ion-button
              ></ion-col
            >
          </ion-row>
        </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
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
  IonLabel,
  IonCard,
  IonGrid,
  IonCol,
  IonRow,
} from '@ionic/vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { storeToRefs } from 'pinia';
import router from '@/router';
const settingsStore = useSettingsStore();
const { privateKeyNsec, privateKeyHex, publicKeyNpub, publicKeyHex } =
  storeToRefs(settingsStore);

const join = () => {
  const sk = generatePrivateKey();
  privateKeyNsec.value = nip19.nsecEncode(sk);
  login();
};

const login = () => {
  try {
    // avoid npub
    if (privateKeyNsec.value?.slice(0, 4) !== 'nsec') {
      throw new Error('invalid private key (nsec)');
    }
    const { data: prHex } = nip19.decode(privateKeyNsec.value as string);
    privateKeyHex.value = prHex as string;
    publicKeyHex.value = getPublicKey(privateKeyHex.value as string);
    publicKeyNpub.value = nip19.npubEncode(publicKeyHex.value);
    back();
  } catch (error) {
    privateKeyNsec.value = undefined;
    console.log('invalid private key (nsec)');
  }
};

const back = () => {
  router.push({ name: 'FeedPage' });
};
</script>

<style>
ion-content {
  background-color: #f4f4f4;
  padding: 0px;
}

.card {
  max-width: 400px;
  margin: 0 auto;
  margin-top: 50px;
  padding-top: 20px;
}

ion-item {
  margin-bottom: 16px;
}

ion-button {
  margin-top: 16px;
}

ion-grid {
  max-width: 215px;
}
ion-col {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border: solid 1px #fff;
}

@media (max-width: 480px) {
  ion-item {
    margin-bottom: 12px;
  }
}
</style>
