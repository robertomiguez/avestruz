<template>
  <ion-avatar
    slot="end"
    style="margin-right: 5px"
  >
    <img
      alt=""
      :src="
        (profile?.picture as string) ?? // found on metadata
        (pictureNotFound() as unknown as string) // Not found on metadata
      "
      @click="setProfile()"
      onerror="this.src='oistrich-64.png'"
    />
  </ion-avatar>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUtilStore } from '@/stores/utilStore';
import { User } from '@/types/User';
import { IonAvatar } from '@ionic/vue';

const props = defineProps<{
  profile?: User;
}>();

const utilStore = useUtilStore();
const { selectedProfile } = storeToRefs(utilStore);

const pictureNotFound = () => {
  return import.meta.env.VITE_DEFAULT_IMAGE + Math.random();
};

const setProfile = () => {
  if (props.profile) {
    selectedProfile.value = props.profile;
  }
};
</script>

<style scoped>
ion-avatar {
  max-width: 45px;
  max-height: 45px;
  cursor: pointer;
}
</style>
