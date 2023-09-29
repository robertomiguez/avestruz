<template>
  <ion-button
    v-show="!publicKeyNpub"
    fill="outline"
    class="button-login"
    @click="login"
    >Login</ion-button
  >
</template>

<script setup lang="ts">
import router from '@/router';
import { IonButton } from '@ionic/vue';
import { useSettingsStore } from '@/stores/settingsStore';
import { storeToRefs } from 'pinia';

const settingsStore = useSettingsStore();
const { publicKeyNpub } = storeToRefs(settingsStore);

const login = () => {
  router.push({ name: 'LoginPage' });
};
</script>

<style scoped>
.button-login {
  padding: 10px;
}
</style>
