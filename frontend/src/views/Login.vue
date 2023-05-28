<script setup>
import { NSpin, NButton, useMessage } from 'naive-ui'
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from 'vue-router'
import { useStorage } from '@vueuse/core'

const state_jwt = useStorage('jwt')
const API_BASE = import.meta.env.VITE_API_BASE || "";
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const message = useMessage();

onMounted(async () => {
    if (route.path === '/login/github') {
        loading.value = true;
        try {
            const response = await fetch(`${API_BASE}/api/v1/oauth`, {
                method: "POST",
                body: JSON.stringify({
                    login_type: "github",
                    code: route.query.code,
                }),
                headers: {
                    "Content-Type": "application/json"
                },
            });
            if (!response.ok) {
                message.error(`${response.status} ${await response.text()}` || "登录失败");
            }
            let res = await response.json();
            state_jwt.value = res;
            window.location.href = "/";
        } catch (error) {
            console.error(error);
            message.error(`登录失败: ${error.message || "未知错误"}`);
        }
        finally {
            loading.value = false;
        }
    }
})

const onGithubLogin = async () => {
    try {
        loading.value = true;
        const response = await fetch(`${API_BASE}/api/v1/login?login_type=github&redirect_url=${window.location.origin}/login/github`, {
            method: "GET",
        });
        if (!response.ok) {
            message.error(`${response.status} ${await response.text()}` || "登录失败");
        }
        let res = await response.json();
        window.location.href = res;
    } catch (error) {
        console.error(error);
        message.error(error.message || "登录失败");
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <n-spin size="large" description="正在登录..." :show="loading">
        <n-button type="primary" block strong @click="onGithubLogin">Github 登录</n-button>
        <n-button type="secondary" block strong @click="router.push('/')">返回主页</n-button>
    </n-spin>
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
