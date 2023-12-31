<template>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <img
          :src="profile?.banner as string"
          alt=""
        />
      </div>
      <div class="body">
        <div slot="end">
          <user-avatar
            cssAssigned="profile"
            :profile="profile as User"
          />
        </div>
        <div class="name">
          {{ profile.name }} {{ profile.display_name }}
          <ion-icon
            v-show="profile?.checked"
            :icon="personCircleOutline"
            class="icon-verified"
          ></ion-icon>
          <ion-icon
            v-show="props.publicKeyHex === props.profile.pubkey"
            :icon="refreshCircleOutline"
            class="icon-verified"
            @click="updateMyProfile"
          ></ion-icon>
        </div>
        <div class="nip05">{{ profile?.nip05 }}</div>
        <div class="pubkey">{{ profile.pubkey }}</div>
        <div class="intro">
          <p>
            {{ profile.about }}
          </p>
        </div>
        <div class="info-counts">
          <div>
            <div>171 Followers</div>
          </div>
          <div>
            <div>33 Following</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserAvatar from '@/components/UserAvatar.vue';
import EventService from '@/services/EventService';
import type { User } from '@/types/User';
import { IonIcon } from '@ionic/vue';
import { personCircleOutline, refreshCircleOutline } from 'ionicons/icons';

const props = defineProps<{
  profile: User;
  publicKeyHex: string;
}>();

const updateMyProfile = () => {
  const relays: string[] = import.meta.env.VITE_RELAYS.split(',');

  if (props.publicKeyHex === props.profile.pubkey) {
    for (const relay of relays) {
      EventService.initializeWsMyUser(relay, [props.profile.pubkey]);
    }
  }
};
</script>

<style scoped>
body {
  font-family: 'Montserrat', sans-serif;
  background-color: var(--light);
}
img {
  width: 100%;
  height: auto;
}
.wrapper {
  width: 100%;
  height: auto;
}
.card {
  width: 400px;
  height: auto;
  text-align: center;
  margin: 0px auto;
  box-shadow: 0px 0px 15px #ccc;
}
.card .header {
  height: 100px;
}

.card .body {
  background-color: var(--white);
  padding: 20px 40px 40px 40px;
}

.card .body .author-img {
  margin-top: -20px;
  margin-bottom: 20px;
}
.card .body .author-img img {
  width: 170px;
  height: 170px;
  border-radius: 50%;
  padding: 5px;
  background-color: var(--white);
}

.card .body .name {
  font-size: 18px;
  font-weight: 600;
  /* text-transform: uppercase; */
}
.card .body .nip05 {
  font-size: 11px;
  font-weight: 200;
  line-height: 1.6;
  margin: 10px 0px 0px 0px;
}

.card .body .pubkey {
  font-size: 11px;
  font-weight: 200;
  line-height: 1.6;
  margin: 10px 0px 0px 0px;
}

.card .body .intro {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
  margin: 10px 0px 50px 0px;
}

.card .body .info-counts {
  display: flex;
  margin-left: 60px;
  margin-top: 10px;
}

.card .body .info-counts div {
  display: flex;
  margin-right: 20px;
}
.card .body .info-counts div svg {
  color: #657786;
  margin-right: 10px;
}

@media (max-width: 480px) {
  .card {
    width: 100%;
  }
}
</style>
