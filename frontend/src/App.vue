<script setup>
import { NGrid, NGi, NInput, NButton, NSpace, NCard, NSpin, NTabs, NTabPane, NDatePicker, NSwitch } from 'naive-ui'
import { watch, onMounted, ref } from "vue";
import MarkdownIt from 'markdown-it';

const prompt = ref("");
const result = ref("");
const prompt_type = ref("tarot");
const lunarBirthday = ref('龙年 庚辰年 八月十九 狮子座')
const birthday = ref("2000-08-17 00:00:00");
const loading = ref(false);
const API_BASE = import.meta.env.VITE_API_BASE || "";
const md = new MarkdownIt();

const onSubmit = async () => {
  try {
    loading.value = true;
    const response = await fetch(`${API_BASE}/api/divination`, {
      method: "POST",
      body: JSON.stringify({
        prompt: prompt.value || "我的财务状况如何",
        prompt_type: prompt_type.value,
        birthday: birthday.value,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(JSON.stringify(response));
    }
    let res = await response.json();
    result.value = md.render(res);
  } catch (error) {
    console.error(error);
    result.value = error.message || "占卜失败";
  } finally {
    loading.value = false;
  }
};

watch(birthday, async (newBirthday, oldBirthday) => {
  lunarBirthday.value = '转换中...'
  try {
    const res = await fetch(`${API_BASE}/api/date?date=${newBirthday}`)
    lunarBirthday.value = await res.json()
  } catch (error) {
    console.error(error)
  }
})


onMounted(() => {
  (window.adsbygoogle = window.adsbygoogle || []).push({});
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
            <h1>AI 占卜</h1>
            <h4>本项目仅供娱乐</h4>
            <n-tabs v-model:value="prompt_type" type="segment" animated>
              <n-tab-pane name="tarot" tab="塔罗牌">
                <n-input v-model:value="prompt" type="textarea" round maxlength="100" :autosize="{ minRows: 3 }"
                  placeholder="我的财务状况如何" />
              </n-tab-pane>
              <n-tab-pane name="birthday" tab="生辰八字">
                <n-date-picker v-model:formatted-value="birthday" value-format="yyyy-MM-dd HH:mm:ss" type="datetime" />
                <p>农历: {{ lunarBirthday }}</p>
              </n-tab-pane>
              <n-tab-pane name="name" tab="姓名五格">
                <n-input v-model:value="prompt" type="text" maxlength="10" round placeholder="请输入姓名" />
              </n-tab-pane>
            </n-tabs>
            <div class="button-container">
              <n-button class="center" @click="onSubmit" tertiary round type="primary">
                占卜
              </n-button>
            </div>
            <n-card title="占卜结果">
              <div class="result" v-html="result"></div>
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

.n-switch {
  margin-top: 12px;
  text-align: center;
  margin-bottom: 12px;
}

.result {
  text-align: left;
}
</style>
