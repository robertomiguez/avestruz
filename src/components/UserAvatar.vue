<template>
  <ion-avatar
    :class="cssAssigned === 'profile' ? 'avatar-profile' : 'avatar-post'"
  >
    <img
      alt=""
      :src="avatarSrc"
      @click="setProfile"
      @error="useFallback"
    />
  </ion-avatar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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
const fallbackSrc = ref('oistrich-64.png');

const avatarSrc = computed(
  () =>
    props.profile?.picture ||
    `${import.meta.env.VITE_DEFAULT_IMAGE}${props.profile?.pubkey ?? 'anon'}`,
);

const useFallback = (event: Event) => {
  const image = event.target as HTMLImageElement;
  image.src = fallbackSrc.value;
};

const setProfile = () => {
  if (props.profile) {
    selectedProfile.value = props.profile;
  }
};
</script>

<style scoped>
.avatar-profile {
  width: 108px;
  height: 108px;
  border: 4px solid #ffffff;
  background-color: #ffffff;
  cursor: pointer;
}

.avatar-post {
  width: 44px;
  height: 44px;
  cursor: pointer;
}
</style>
