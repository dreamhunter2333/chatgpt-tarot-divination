<script setup>
import { NGrid, NGi, NSpace, NAlert, NButton, NMessageProvider } from 'naive-ui'
import { NConfigProvider, NGlobalStyle, NBackTop } from 'naive-ui';
import { onMounted, ref, computed } from "vue";
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { useIsMobile } from './utils/composables'
import { zhCN } from 'naive-ui'

const state_jwt = useStorage('jwt')
const isMobile = useIsMobile()

const router = useRouter()
const settings = ref({});

const API_BASE = import.meta.env.VITE_API_BASE || "";

const logOut = () => {
  state_jwt.value = "";
  router.go(0);
};

const fetchSettings = async () => {
  const response = await fetch(`${API_BASE}/api/v1/settings`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${state_jwt.value || "xxx"}`,
      "Content-Type": "application/json"
    },
  });
  if (response.ok) {
    settings.value = await response.json();
  }
}

onMounted(async () => {
  fetchSettings();
  (window.adsbygoogle = window.adsbygoogle || []).push({});
  (window.adsbygoogle = window.adsbygoogle || []).push({});
});
</script>

<template>
  <n-config-provider :locale="zhCN">
    <n-global-style />
    <n-message-provider>
      <n-grid x-gap="12" :cols="isMobile ? 4 : 6">
        <n-gi v-if="!isMobile">
          <div class="side">
            <ins class="adsbygoogle" style="display:block" :data-ad-client="settings.ad_client"
              :data-ad-slot="settings.ad_slot" data-ad-format="auto" data-full-width-responsive="true"></ins>
          </div>
        </n-gi>
        <n-gi span="4">
          <div class="main">
            <n-space vertical>
              <h2>AI 占卜 - 本项目仅供娱乐</h2>
              <n-layout>
                <n-alert v-if="settings.user_name" type="success">
                  你好, {{ settings.login_type }} 用户 {{ settings.user_name }}
                  <n-button tertiary type="primary" round @click="logOut">登出</n-button>
                  <n-button tag="a" target="_blank" tertiary type="primary" round
                    href="https://github.com/dreamhunter2333/chatgpt-tarot-divination">☆ Github</n-button>
                </n-alert>
                <n-alert v-else type="warning">
                  当前未登录, 处于限流模式 ({{ settings.rate_limit }})
                  <n-button type="warning" round @click="router.push('/login')">登录</n-button>
                  <n-button tag="a" target="_blank" tertiary type="primary" round
                    href="https://github.com/dreamhunter2333/chatgpt-tarot-divination">☆ Github</n-button>
                </n-alert>
                <n-layout>
                  <router-view></router-view>
                </n-layout>
              </n-layout>
            </n-space>
          </div>
        </n-gi>
        <n-gi v-if="!isMobile">
          <div class="side">
            <ins class="adsbygoogle" style="display:block" :data-ad-client="settings.ad_client"
              :data-ad-slot="settings.ad_slot" data-ad-format="auto" data-full-width-responsive="true"></ins>
          </div>
        </n-gi>
      </n-grid>
    </n-message-provider>
    <n-back-top />
  </n-config-provider>
</template>

<style scoped>
.side {
  height: 100vh;
}

.main {
  height: 100vh;
  text-align: center;
}

.n-grid {
  height: 100%;
}

.n-gi {
  height: 100%;
}

.n-space {
  height: 100%;
}

.n-alert {
  text-align: center;
}
</style>
