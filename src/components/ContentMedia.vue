<template>
  <span class="content-media">
    <template
      v-for="segment in segments"
      :key="segment.key"
    >
      <span v-if="segment.type === 'text'">{{ segment.value }}</span>
      <a
        v-else-if="segment.type === 'link'"
        :href="segment.value"
        target="_blank"
        rel="noreferrer"
      >
        {{ segment.value }}
      </a>
      <img
        v-else-if="segment.type === 'image'"
        :src="segment.value"
        alt=""
        loading="lazy"
      />
      <video
        v-else
        controls
        preload="metadata"
      >
        <source :src="segment.value" />
      </video>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  content: string;
}>();

type Segment = {
  key: string;
  type: 'text' | 'link' | 'image' | 'video';
  value: string;
};

const urlRegex = /(https?:\/\/[^\s]+)/g;
const imageRegex = /\.(jpe?g|gif|png|webp)(\?.*)?$/i;
const videoRegex = /\.(mp4|webm)(\?.*)?$/i;

const getSegmentType = (value: string): Segment['type'] => {
  if (imageRegex.test(value)) {
    return 'image';
  }

  if (videoRegex.test(value)) {
    return 'video';
  }

  return 'link';
};

const segments = computed<Segment[]>(() => {
  const parts: Segment[] = [];
  let lastIndex = 0;

  for (const match of props.content.matchAll(urlRegex)) {
    const value = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push({
        key: `text-${lastIndex}`,
        type: 'text',
        value: props.content.slice(lastIndex, index),
      });
    }

    parts.push({
      key: `url-${index}`,
      type: getSegmentType(value),
      value,
    });
    lastIndex = index + value.length;
  }

  if (lastIndex < props.content.length) {
    parts.push({
      key: `text-${lastIndex}`,
      type: 'text',
      value: props.content.slice(lastIndex),
    });
  }

  return parts.length
    ? parts
    : [{ key: 'text-0', type: 'text', value: props.content }];
});
</script>

<style scoped>
.content-media {
  white-space: pre-wrap;
}

a {
  color: #2563eb;
  overflow-wrap: anywhere;
}

img,
video {
  display: block;
  width: 100%;
  max-height: 420px;
  margin-top: 10px;
  border-radius: 10px;
  object-fit: cover;
  background: #f4f5f8;
}
</style>
