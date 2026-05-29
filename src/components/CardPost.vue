<template>
  <article class="post-card">
    <header class="post-header">
      <user-avatar
        v-if="profile"
        :profile="profile as User"
        class="avatar"
      />
      <div
        v-else
        class="avatar-fallback"
        aria-hidden="true"
      >
        {{ pubkey.slice(0, 2) }}
      </div>

      <div class="author-block">
        <div class="author-row">
          <strong
            class="author-name"
            :title="displayName"
          >
            {{ displayName }}
          </strong>
          <ion-icon
            v-show="profile?.checked"
            :icon="personCircleOutline"
            class="verified-icon"
            aria-label="Verified NIP-05"
          ></ion-icon>
          <span class="timestamp">{{ moment }}</span>
        </div>
        <span
          class="pubkey"
          :title="pubkey"
        >
          {{ shortPubkey }}
        </span>
      </div>
    </header>

    <div class="post-content">
      <content-media :content="content" />
    </div>

    <div
      v-if="hashtags.length"
      class="hashtags"
    >
      <ion-chip
        v-for="hashtag of hashtags"
        :key="hashtag"
        color="medium"
        class="hashtag"
      >
        #{{ hashtag }}
      </ion-chip>
    </div>

    <footer class="post-footer">
      <span
        class="relay"
        :title="relay"
      >
        {{ relay }}
      </span>

      <div class="post-actions">
        <button
          class="icon-button"
          type="button"
          :aria-label="replyLabel"
          :disabled="!canReply || replyPending"
          @click="emit('reply')"
        >
          <ion-icon
            aria-hidden="true"
            :icon="chatbubbleOutline"
          />
        </button>
        <button
          class="icon-button"
          type="button"
          aria-label="Repost"
        >
          <ion-icon
            aria-hidden="true"
            :icon="swapHorizontalOutline"
          />
        </button>
        <button
          class="icon-button like-button"
          :class="{ liked: likedByMe }"
          type="button"
          :aria-label="likeLabel"
          :disabled="!canLike || likedByMe || likePending"
          @click="emit('like')"
        >
          <ion-icon
            aria-hidden="true"
            :icon="likedByMe ? heart : heartOutline"
          />
          <span class="action-count">{{ likeCount }}</span>
        </button>
        <button
          class="icon-button"
          type="button"
          aria-label="Share"
        >
          <ion-icon
            aria-hidden="true"
            :icon="navigateOutline"
          />
        </button>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon, IonChip } from '@ionic/vue';
import {
  chatbubbleOutline,
  swapHorizontalOutline,
  heart,
  heartOutline,
  navigateOutline,
  personCircleOutline,
} from 'ionicons/icons';
import ContentMedia from '@/components/ContentMedia.vue';
import { truncate } from '@/composables/truncate';
import UserAvatar from '@/components/UserAvatar.vue';
import { User } from '@/types/User';

const props = defineProps<{
  pubkey: string;
  moment: string;
  content: string;
  hashtags: string[];
  relay: string;
  profile?: User;
  likeCount: number;
  likedByMe: boolean;
  canLike: boolean;
  likePending: boolean;
  canReply: boolean;
  replyPending: boolean;
}>();

const emit = defineEmits<{
  like: [];
  reply: [];
}>();

const displayName = computed(() =>
  truncate(
    props.profile?.name ?? props.profile?.display_name ?? props.pubkey ?? 'Anon',
    28,
  ),
);

const shortPubkey = computed(() => truncate(props.pubkey, 18));

const likeLabel = computed(() => {
  if (props.likedByMe) {
    return `Liked. ${props.likeCount} likes`;
  }

  if (!props.canLike) {
    return `Sign in to like. ${props.likeCount} likes`;
  }

  return `Like. ${props.likeCount} likes`;
});

const replyLabel = computed(() => {
  if (!props.canReply) {
    return 'Sign in to reply';
  }

  if (props.replyPending) {
    return 'Publishing reply';
  }

  return 'Reply';
});
</script>

<style scoped>
.post-card {
  width: 100%;
  background: #fbfdff;
  border: 1px solid #cfe3ff;
  border-left: 4px solid #3dc2ff;
  border-radius: 10px;
  padding: 18px;
}

.post-card:nth-child(even) {
  background: #f6fbff;
  border-left-color: #5260ff;
}

.post-header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.avatar {
  flex: 0 0 auto;
}

.author-block {
  min-width: 0;
}

.author-row {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 6px;
}

.author-name {
  overflow: hidden;
  color: #111827;
  font-size: 15px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verified-icon {
  flex: 0 0 auto;
  color: #2563eb;
  font-size: 16px;
}

.timestamp,
.pubkey,
.relay {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
}

.post-content {
  margin-top: 14px;
  padding: 12px;
  border-radius: 10px;
  background: #ffffff;
  color: #111827;
  font-size: 15px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.hashtags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.hashtag {
  margin: 0;
}

.post-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 14px;
}

.relay {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-actions {
  display: flex;
  flex: 0 0 auto;
  gap: 4px;
}

.icon-button {
  display: inline-grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}

.icon-button:hover,
.icon-button:focus-visible {
  background: #eff6ff;
  color: #3880ff;
  outline: none;
}

.icon-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.icon-button:disabled:hover {
  background: transparent;
  color: #6b7280;
}

.like-button {
  grid-template-columns: auto auto;
  width: auto;
  min-width: 48px;
  column-gap: 4px;
  padding: 0 10px;
}

.like-button.liked {
  color: #eb445a;
}

.like-button.liked:disabled:hover {
  color: #eb445a;
}

.action-count {
  min-width: 1ch;
  font-size: 12px;
  line-height: 1;
}

@media (max-width: 430px) {
  .post-card {
    padding: 16px;
  }

  .post-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
