<template>
  <div class="post-wrap">
    <div class="post-header">
      <img
        :src="
          (picture as string) ?? // found on metadata
          (pictureNotFound() as unknown as string) // Not found on metadata
        "
        alt=""
        class="avator"
        onerror="this.src='oistrich-64.png'"
      />

      <div class="post-header-info">
        <span class="tooltip"
          >{{ truncate(displayName, 15) }}
          <span class="tooltiptext">{{ displayName }}</span></span
        ><span>. {{ moment }} </span>
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
} from 'ionicons/icons';
import ContentMedia from '@/components/ContentMedia.vue';
import { truncate } from '@/composables/truncate';

defineProps<{
  displayName: string;
  picture?: string;
  moment: string;
  content: string;
  hashtags: string[];
}>();

const pictureNotFound = () => {
  return import.meta.env.VITE_DEFAULT_IMAGE + Math.random();
};
</script>

<style scoped>
body {
  background: #e6ecf0;
}
img {
  max-width: 100%;
  max-height: 100%;
}
.content {
  padding-top: 15px;
}
.avator {
  border-radius: 100px;
  width: 48px;
  margin-right: 15px;
}

.post-wrap {
  max-width: 490px;
  background: #fff;
  margin: 0 auto;
  margin-top: 0px;
  border-radius: 3px;
  padding: 30px;
  border-bottom: 1px solid #e6ecf0;
  border-top: 1px solid #e6ecf0;
}
.post-header {
  display: flex;
  align-items: flex-start;
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

.tooltip {
  position: relative;
  display: inline-block;
  border-bottom: 1px black;
}
.tooltip .tooltiptext {
  visibility: hidden;
  width: 180px;
  background-color: black;
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 0;
  position: absolute;
  z-index: 1;
  top: -5px;
  left: 110%;
}
.tooltip .tooltiptext::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 100%;
  margin-top: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: transparent black transparent transparent;
}
.tooltip:hover .tooltiptext {
  visibility: visible;
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
