<template>
  <ion-avatar
    :class="cssAssigned === 'profile' ? 'avatar-profile' : 'avatar-post'"
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

const props = withDefaults(
  defineProps<{
    profile?: User;
    cssAssigned?: string;
  }>(),
  {
    cssAssigned: 'post',
  },
);

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
.avatar-profile {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  padding: 5px;
  background-color: var(--white);
  cursor: pointer;
  text-align: center;
  margin: 0px auto;
}

.avatar-post {
  max-width: 45px;
  max-height: 45px;
}
</style>
