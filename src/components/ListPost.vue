<template>
  <card-post
    v-for="textNoteUser of textNotesUsers"
    :key="textNoteUser.textNote.id"
    :pubkey="textNoteUser.textNote?.pubkey as string"
    :moment="formatTimeDifference(textNoteUser.textNote.created_at)"
    :content="textNoteUser.textNote.content"
    :hashtags="
      textNoteUser.textNote.tags.filter(t => t[0] === 't').map(t => t[1])
    "
    :relay="textNoteUser.textNote.relay"
    :profile="textNoteUser.user"
    :like-count="textNoteUser.likeCount"
    :liked-by-me="Boolean(privateKeyHex) && textNoteUser.likedByMe"
    :can-like="Boolean(privateKeyHex)"
    :like-pending="isLikePending(textNoteUser.textNote)"
    :can-reply="Boolean(privateKeyHex)"
    :reply-pending="isReplyPending(textNoteUser.textNote)"
    @like="likePost(textNoteUser)"
    @reply="openReply(textNoteUser)"
  />

  <ion-modal
    :is-open="Boolean(replyingTo)"
    :backdrop-dismiss="!publishingReply"
    @didDismiss="closeReply"
  >
    <ion-header>
      <ion-toolbar>
        <ion-title>Reply</ion-title>
        <ion-buttons slot="end">
          <ion-button
            :disabled="publishingReply"
            @click="closeReply"
          >
            Cancel
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="reply-modal-content">
      <section
        v-if="replyingTo"
        class="reply-composer"
      >
        <div class="reply-target">
          <strong
            class="reply-target-author"
            :title="replyingTo.textNote.pubkey"
          >
            {{ replyTargetName }}
          </strong>
          <p class="reply-target-content">
            {{ replyingTo.textNote.content }}
          </p>
        </div>

        <ion-textarea
          v-model="replyContent"
          :auto-grow="true"
          placeholder="Write a reply..."
          class="reply-input"
        ></ion-textarea>

        <div class="reply-footer">
          <span class="reply-status">
            {{ replyStatusMessage }}
          </span>
          <ion-button
            size="small"
            :disabled="!canPublishReply"
            @click="publishReply"
          >
            {{ publishingReply ? 'Publishing' : 'Publish' }}
          </ion-button>
        </div>
      </section>
    </ion-content>
  </ion-modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/vue';
import { useEventStore } from '@/stores/eventStore';
import { useSettingsStore } from '@/stores/settingsStore';
import CardPost from '@/components/CardPost.vue';
import { formatTimeDifference } from '@/composables/formatTimeDifference';
import { truncate } from '@/composables/truncate';
import EventService from '@/services/EventService';
import type { TextNote } from '@/types/TextNote';
import type { TextNoteUser } from '@/types/TextNoteUser';

const eventStore = useEventStore();
const { textNotesUsers } = storeToRefs(eventStore);
const settingsStore = useSettingsStore();
const { privateKeyHex } = storeToRefs(settingsStore);
const likingPosts = ref<Set<string>>(new Set());
const replyingTo = ref<TextNoteUser>();
const replyContent = ref<string>();
const replyStatus = ref<string>();
const publishingReply = ref(false);

const postKey = (textNote: TextNote): string => textNote.id;

const isLikePending = (textNote: TextNote): boolean =>
  likingPosts.value.has(postKey(textNote));

const setLikePending = (textNote: TextNote, pending: boolean): void => {
  const next = new Set(likingPosts.value);

  if (pending) {
    next.add(postKey(textNote));
  } else {
    next.delete(postKey(textNote));
  }

  likingPosts.value = next;
};

const isReplyPending = (textNote: TextNote): boolean =>
  publishingReply.value && replyingTo.value?.textNote.id === postKey(textNote);

const replyTargetName = computed(() => {
  if (!replyingTo.value) {
    return '';
  }

  return truncate(
    replyingTo.value.user?.name ??
      replyingTo.value.user?.display_name ??
      replyingTo.value.textNote.pubkey,
    32,
  );
});

const replyStatusMessage = computed(
  () =>
    replyStatus.value ??
    (privateKeyHex.value
      ? 'Ready to sign and publish.'
      : 'Sign in with an nsec to reply.'),
);

const canPublishReply = computed(
  () =>
    Boolean(privateKeyHex.value) &&
    Boolean(replyingTo.value) &&
    Boolean(replyContent.value?.trim()) &&
    !publishingReply.value,
);

const openReply = (textNoteUser: TextNoteUser): void => {
  if (!privateKeyHex.value || publishingReply.value) {
    return;
  }

  replyingTo.value = textNoteUser;
  replyContent.value = undefined;
  replyStatus.value = undefined;
};

const closeReply = (): void => {
  if (publishingReply.value) {
    return;
  }

  replyingTo.value = undefined;
  replyContent.value = undefined;
  replyStatus.value = undefined;
};

const likePost = async (textNoteUser: TextNoteUser): Promise<void> => {
  if (
    !privateKeyHex.value ||
    textNoteUser.likedByMe ||
    isLikePending(textNoteUser.textNote)
  ) {
    return;
  }

  setLikePending(textNoteUser.textNote, true);

  try {
    await EventService.publishLike(textNoteUser.textNote);
  } finally {
    setLikePending(textNoteUser.textNote, false);
  }
};

const publishReply = async (): Promise<void> => {
  const textNote = replyingTo.value?.textNote;
  const content = replyContent.value?.trim();

  if (!textNote || !content || !canPublishReply.value) {
    return;
  }

  let published = false;
  publishingReply.value = true;
  replyStatus.value = 'Signing and publishing to relays...';

  try {
    const results = await EventService.publishReply(textNote, content);
    const accepted = results.filter(
      result => result.status === 'accepted',
    ).length;

    published = accepted > 0;
    replyStatus.value = published
      ? `Published to ${accepted} of ${results.length} relays.`
      : 'Publish failed. Check your relays and try again.';
  } catch {
    replyStatus.value = 'Publish failed. Check your relays and try again.';
  } finally {
    publishingReply.value = false;
  }

  if (published) {
    closeReply();
  }
};
</script>

<style scoped>
.reply-modal-content {
  --padding-bottom: 16px;
  --padding-end: 16px;
  --padding-start: 16px;
  --padding-top: 16px;
}

.reply-composer {
  display: grid;
  gap: 12px;
}

.reply-target {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #ffffff;
}

.reply-target-author {
  overflow: hidden;
  color: #111827;
  font-size: 14px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reply-target-content {
  display: -webkit-box;
  overflow: hidden;
  margin: 0;
  color: #4b5563;
  font-size: 13px;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}

.reply-input {
  --background: #eff6ff;
  --border-radius: 8px;
  --color: #111827;
  --padding-bottom: 12px;
  --padding-end: 12px;
  --padding-start: 12px;
  --padding-top: 12px;
  min-height: 120px;
}

.reply-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.reply-status {
  color: #6b7280;
  font-size: 12px;
  line-height: 1.4;
}

@media (max-width: 430px) {
  .reply-footer {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
