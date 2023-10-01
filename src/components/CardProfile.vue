<template>
  <div>
    <div>
      <user-avatar :profile="profile" />
      {{ profile }}
      <div>
        <span>{{ profile.display_name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar.vue';
import type { User } from '@/types/User';

defineProps<{
  profile: User;
}>();
</script>

<style scoped></style>
