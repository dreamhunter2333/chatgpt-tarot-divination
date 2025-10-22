<script setup>
import { ref, computed, onMounted } from 'vue'
import { NCard, NFormItemRow, NSwitch, NInput, NButton, NSpace } from 'naive-ui'
import { useGlobalState } from '../store'

const { customOpenAISettings, settings } = useGlobalState()

// 临时编辑变量
const tempSettings = ref({
    enable: false,
    baseUrl: '',
    apiKey: '',
    model: ''
})

const loading = ref(false)

// 初始化临时变量，使用 customOpenAISettings，不存在时 fallback 到 settings 返回的值
const initTempSettings = () => {
    tempSettings.value = {
        enable: customOpenAISettings.value.enable,
        baseUrl: customOpenAISettings.value.baseUrl || settings.value.default_api_base || '',
        apiKey: customOpenAISettings.value.apiKey || '',
        model: customOpenAISettings.value.model || settings.value.default_model || ''
    }
}

onMounted(() => {
    initTempSettings()
})

const goToPurchase = () => {
    if (settings.value.purchase_url) {
        window.open(settings.value.purchase_url, '_blank')
    }
}

const saveSettings = async () => {
    loading.value = true
    try {
        customOpenAISettings.value = { ...tempSettings.value }
    } finally {
        loading.value = false
    }
}

const hasPurchaseUrl = computed(() => {
    return settings.value.purchase_url && settings.value.purchase_url !== ''
})

</script>

<template>
    <div class="center">
        <n-card :bordered="false" embedded>
            <n-space justify="end" style="margin-bottom: 12px;">
                <n-button :loading="loading" @click="saveSettings" type="primary">
                    保存
                </n-button>
            </n-space>
            <n-form-item-row label="启用自定义 API 设置">
                <n-switch v-model:value="tempSettings.enable" :round="false" />
            </n-form-item-row>
            <n-form-item-row label="API 地址">
                <n-input v-model:value="tempSettings.baseUrl" />
            </n-form-item-row>
            <n-form-item-row>
                <template #label>
                    <span>API 密钥</span>
                    <n-button v-if="hasPurchaseUrl" text type="primary" @click="goToPurchase" style="margin-left: 8px;">
                        获取 API_KEY
                    </n-button>
                </template>
                <n-input v-model:value="tempSettings.apiKey" />
            </n-form-item-row>
            <n-form-item-row label="模型">
                <n-input v-model:value="tempSettings.model" />
            </n-form-item-row>
        </n-card>
    </div>
</template>

<style scoped>
.center {
    display: flex;
    justify-content: center;
}

.n-card {
    max-width: 800px;
    text-align: left;
}
</style>
