<script setup>
import { NCard, NFormItemRow, NSwitch, NInput } from 'naive-ui'
import { useGlobalState } from '../store'

const { customOpenAISettings } = useGlobalState()

</script>

<template>
    <div class="center">
        <n-card :bordered="false" embedded>
            <n-form-item-row label="启用自定义 API 设置">
                <n-switch v-model:value="customOpenAISettings.enable" :round="false" />
            </n-form-item-row>
            <n-form-item-row label="API 地址">
                <n-input v-model:value="customOpenAISettings.baseUrl" />
            </n-form-item-row>
            <n-form-item-row label="API 密钥">
                <n-input v-model:value="customOpenAISettings.apiKey" />
            </n-form-item-row>
            <n-form-item-row label="模型">
                <n-input v-model:value="customOpenAISettings.model" />
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
