<script setup>
import { NGrid, NGi, NInput, NButton, NSpace, NCard, NSpin, NCode } from 'naive-ui'
import { onMounted, ref } from "vue";

const prompt = ref("");
const result = ref("");
const loading = ref(false);
const API_BASE = import.meta.env.VITE_API_BASE || "";

const onSubmit = async () => {
  try {
    loading.value = true;
    let urlencoded = new URLSearchParams();
    urlencoded.append("prompt", prompt.value || "我的财务状况如何");
    const response = await fetch(`${API_BASE}/chatgpt`, {
      method: "POST",
      body: urlencoded,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!response.ok) {
      throw new Error(JSON.stringify(response));
    }
    result.value = await response.json();
  } catch (error) {
    console.error(error);
    result.value = error.message || "占卜失败";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
});
</script>

<template>
  <n-grid x-gap="12" :cols="6">
    <n-gi>
      <div class="side">
        <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8486711392183862" data-ad-slot="9515796661"
          data-ad-format="auto" data-full-width-responsive="true"></ins>
      </div>
    </n-gi>
    <n-gi span="4">
      <n-spin :show="loading">
        <div class="main">
          <n-space vertical>
            <h1>AI 塔罗牌占卜</h1>
            <n-input v-model:value="prompt" type="textarea" maxlength="100" :autosize="{ minRows: 3 }"
              placeholder="我的财务状况如何" />
            <div class="button-container">
              <n-button class="center" @click="onSubmit" tertiary round type="primary">
                占卜
              </n-button>
            </div>
            <n-card title="占卜结果">
              <n-code :code="result" language="markdown" word-wrap />
            </n-card>
          </n-space>
        </div>
      </n-spin>
    </n-gi>
    <n-gi>
      <div class="side">
        <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8486711392183862" data-ad-slot="3072024858"
          data-ad-format="auto" data-full-width-responsive="true"></ins>
      </div>
    </n-gi>
  </n-grid>
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

.n-input {
  margin-top: 12px;
}

.button-container {
  display: flex;
  justify-content: center;
}

.n-button {
  margin-top: 12px;
  text-align: center;
  margin-bottom: 12px;
}

.n-code {
  text-align: left;
}
</style>
