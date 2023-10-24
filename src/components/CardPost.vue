<template>
  <div class="post-wrap">
    <div class="post-header">
      <div class="post-header-info">
        <user-avatar
          v-if="profile"
          :profile="profile as User"
          class="avatar"
        />
        <span class="name"
          >{{ name() }}
          <ion-icon
            v-show="profile?.checked"
            :icon="personCircleOutline"
            class="icon-verified"
          ></ion-icon>
          <span>
            {{ moment }}
          </span></span
        >
        <div class="content">
          <content-media :content="content" />
        </div>
        <div class="content">
          <ion-chip
            v-for="hashtag of hashtags"
            :key="hashtag"
            color="medium"
            >{{ hashtag }}</ion-chip
          >
        </div>
      </div>
    </div>
    <span class="relay">{{ profile?.relay }}</span>
    <div class="post-info-counts">
      <div class="comments">
        <ion-icon
          aria-hidden="true"
          :icon="chatbubbleOutline"
        />
        <div class="comment-count">33</div>
      </div>
      <div class="reposts">
        <ion-icon
          aria-hidden="true"
          :icon="swapHorizontalOutline"
        />
        <div class="repost-count">397</div>
      </div>

      <div class="likes">
        <ion-icon
          aria-hidden="true"
          :icon="heartOutline"
        />
        <div class="likes-count">2.6k</div>
      </div>

      <div class="message">
        <ion-icon
          aria-hidden="true"
          :icon="navigateOutline"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonChip } from '@ionic/vue';
import {
  chatbubbleOutline,
  swapHorizontalOutline,
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
  profile?: User;
}>();

const name = () => {
  return truncate(
    JSON.stringify(props.profile) === '{}'
      ? props.pubkey // user not found in relay
      : props.profile?.name ?? props.profile?.display_name ?? 'Anon',
    15,
  );
};
</script>

<style scoped>
body {
  background: #e6ecf0;
}

.avatar {
  float: left; /* Float the avatar to the left */
  margin-right: 10px; /* Add some spacing between the image and the text */
}

.name {
  display: block; /* Make the text a block element to ensure it appears below the image */
}

.content {
  display: block;
  padding-top: 15px;
}
.relay {
  font-size: x-small;
}
.post-wrap {
  max-width: 400px;
  background: #fff;
  margin: 0 auto;
  margin-top: 0px;
  border-radius: 3px;
  padding: 30px;
  border-bottom: 1px solid #e6ecf0;
  border-top: 1px solid #e6ecf0;
}
.post-header {
  font-size: 14px;
}
.post-header-info {
  font-weight: bold;
}
.post-header-info span {
  color: #657786;
  font-weight: normal;
  margin-left: 5px;
}
.post-header-info p {
  font-weight: normal;
  margin-top: 5px;
}
.post-img-wrap {
  padding-left: 60px;
}
.post-info-counts {
  display: flex;
  margin-left: 60px;
  margin-top: 10px;
}
.post-info-counts div {
  display: flex;
  margin-right: 20px;
}
.post-info-counts div svg {
  color: #657786;
  margin-right: 10px;
}

@media screen and (max-width: 430px) {
  body {
    padding-left: 20px;
    padding-right: 20px;
  }
  .post-header {
    flex-direction: column;
  }
  .post-header img {
    margin-bottom: 20px;
  }
  .post-header-info p {
    margin-bottom: 30px;
  }
  .post-img-wrap {
    padding-left: 0;
  }
  .post-info-counts {
    display: flex;
    margin-left: 0;
  }
  .post-info-counts div {
    margin-right: 10px;
  }
}
</style>
