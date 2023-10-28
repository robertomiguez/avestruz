<template>
  <div class="post-wrap">
    <div class="textArea">
      <ion-textarea
        v-model="note"
        :auto-grow="true"
        placeholder="Write anything..."
      ></ion-textarea>
      <ion-button
        size="small"
        @click="publish"
        class="publish-button"
        >Publish</ion-button
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonTextarea, IonButton } from '@ionic/vue';
import EventService from '@/services/EventService';

const note = ref<string>();
const publish = () => {
  if (note.value !== undefined) {
    console.log(note.value);
    EventService.publishNote(note.value as string);
    note.value = undefined;
  }
};
</script>

<style scoped>
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
.textArea {
  position: relative;
}

ion-textarea {
  width: 100%;
}

.publish-button {
  position: absolute;
  top: -15px;
  right: 0;
}
</style>
