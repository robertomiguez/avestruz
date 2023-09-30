<template>
  <img
    :src="
      (picture as string) ?? // found on metadata
      (pictureNotFound() as unknown as string) // Not found on metadata
    "
    alt=""
    class="avator"
    onerror="this.src='oistrich-64.png'"
    @click="setUser()"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUtilStore } from '@/stores/utilStore';

const props = defineProps<{
  pubkey: string;
  picture?: string;
}>();

const utilStore = useUtilStore();
const { userSelected } = storeToRefs(utilStore);

const pictureNotFound = () => {
  return import.meta.env.VITE_DEFAULT_IMAGE + Math.random();
};

const setUser = () => {
  if (props.pubkey) {
    userSelected.value = props.pubkey;
  }
};
</script>

<style scoped>
.avator {
  border-radius: 100px;
  width: 48px;
  margin-right: 15px;
}

img {
  max-width: 100%;
  max-height: 100%;
  cursor: pointer;
}
</style>
