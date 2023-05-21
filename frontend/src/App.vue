<script setup>
import { NGrid, NGi, NInput, NButton, NSpace, NCard, NSpin, NTabs, NTabPane, NDatePicker, NSelect, NFormItem, NInputNumber, NLayout, NLayoutSider, NMenu } from 'naive-ui'
import { watch, onMounted, ref } from "vue";
import MarkdownIt from 'markdown-it';

const prompt = ref("");
const result = ref("");
const prompt_type = ref("tarot");
const lunarBirthday = ref('龙年 庚辰年 七月十八 巨蟹座')
const birthday = ref("2000-08-17 00:00:00");
const loading = ref(false);
const API_BASE = import.meta.env.VITE_API_BASE || "";
const md = new MarkdownIt();
const sex = ref("")
const surname = ref("")
const new_name_prompt = ref("")
const sexOptions = [
  { label: "男", value: "男" },
  { label: "女", value: "女" },
]
const menuOptions = [
  {
    label: '塔罗牌',
    key: 'tarot',
  },
  {
    label: '生辰八字',
    key: 'birthday',
  },
  {
    label: '起名',
    key: 'new_name',
  },
  {
    label: '姓名五格',
    key: 'name',
  },
  {
    label: '周公解梦',
    key: 'dream',
  },
  {
    label: '梅花易数',
    key: 'plum_flower',
  },
]
const plum_flower = ref({ num1: 0, num2: 0 })

const onSubmit = async () => {
  try {
    loading.value = true;
    const response = await fetch(`${API_BASE}/api/divination`, {
      method: "POST",
      body: JSON.stringify({
        prompt: prompt.value || "我的财务状况如何",
        prompt_type: prompt_type.value,
        birthday: birthday.value,
        new_name: {
          surname: surname.value,
          sex: sex.value,
          birthday: birthday.value,
          new_name_prompt: new_name_prompt.value
        },
        plum_flower: prompt_type.value == "plum_flower" ? plum_flower.value : null,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${await response.text()}` || "占卜失败");
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
            <h2>AI 占卜 - 本项目仅供娱乐</h2>
            <n-layout has-sider>
              <n-layout-sider bordered>
                <n-menu v-model:value="prompt_type" :options="menuOptions" />
              </n-layout-sider>
              <n-layout>
                <div v-if="prompt_type == 'tarot'">
                  <n-input v-model:value="prompt" type="textarea" round maxlength="40" :autosize="{ minRows: 3 }"
                    placeholder="我的财务状况如何" />
                </div>
                <div v-if="prompt_type == 'birthday'">
                  <div style="display: inline-block;">
                    <n-form-item label="生日" label-placement="left">
                      <n-date-picker v-model:formatted-value="birthday" value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetime" />
                    </n-form-item>
                    <p>农历: {{ lunarBirthday }}</p>
                  </div>
                </div>
                <div v-if="prompt_type == 'new_name'">
                  <div style="display: inline-block;">
                    <n-form-item label="姓氏" label-placement="left">
                      <n-input v-model:value="surname" type="text" maxlength="2" placeholder="请输入姓氏" />
                    </n-form-item>
                    <n-form-item label="性别" label-placement="left">
                      <n-select v-model:value="sex" :options="sexOptions" />
                    </n-form-item>
                    <n-form-item label="生日" label-placement="left">
                      <n-date-picker v-model:formatted-value="birthday" value-format="yyyy-MM-dd HH:mm:ss"
                        type="datetime" />
                    </n-form-item>
                    <n-form-item label="附加" label-placement="left">
                      <n-input v-model:value="new_name_prompt" type="text" maxlength="20" placeholder="" />
                    </n-form-item>
                    <p>农历: {{ lunarBirthday }}</p>
                  </div>
                </div>
                <div v-if="prompt_type == 'name'">
                  <n-input v-model:value="prompt" type="text" maxlength="10" round placeholder="请输入姓名" />
                </div>
                <div v-if="prompt_type == 'dream'">
                  <n-input v-model:value="prompt" type="textarea" round maxlength="40" :autosize="{ minRows: 3 }"
                    placeholder="请输入你的梦境" />
                </div>
                <div v-if="prompt_type == 'plum_flower'">
                  <div style="display: inline-block;">
                    <h4>请随机输入两个 0-1000 的数字</h4>
                    <n-form-item label="数字一" label-placement="left">
                      <n-input-number v-model:value="plum_flower.num1" :min="0" :max="1000" />
                    </n-form-item>
                    <n-form-item label="数字二" label-placement="left">
                      <n-input-number v-model:value="plum_flower.num2" :min="0" :max="1000" />
                    </n-form-item>
                  </div>
                </div>
                <div class="button-container">
                  <n-button class="center" @click="onSubmit" tertiary round type="primary">
                    占卜
                  </n-button>
                </div>
              </n-layout>
            </n-layout>
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

.button-container {
  display: flex;
  justify-content: center;
}

.n-button {
  margin-top: 12px;
  text-align: center;
  margin-bottom: 12px;
}

.result {
  text-align: left;
}
</style>
