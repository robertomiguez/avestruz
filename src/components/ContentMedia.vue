<template>
  <span v-html="contentFormatted"></span>
</template>

<script setup lang="ts">
const props = defineProps<{
  content: string;
}>();

const urlImageRegex = /(http(s?):[/|.|\w|\s|-]*\.(?:jpg|jpeg|gif|png))/g;
const urlVideoRegex = /(http(s?):[/|.|\w|\s|-]*\.(?:mp4))/g;

let contentFormatted = props.content.replace(
  urlImageRegex,
  '<div><img src="$1" width="340" height="auto" style="padding-top: 5px;"/></div>',
);
contentFormatted = contentFormatted.replace(
  urlVideoRegex,
  '<div><video width="340" height="auto" style="padding-top: 5px;" controls><source src="$1"></video></div>',
);
</script>
<style scoped></style>
