import { ref } from "vue";
import {
    createGlobalState, useDark, useToggle, useLocalStorage
} from '@vueuse/core'

export const useGlobalState = createGlobalState(
    () => {
        const isDark = useDark()
        const toggleDark = useToggle(isDark)
        const loading = ref(false);
        const customOpenAISettings = useLocalStorage('customOpenAISettings', {
            enable: false,
            baseUrl: 'https://api.openai.com/v1',
            apiKey: '',
            model: 'gpt-3.5-turbo',
        });
        return {
            isDark,
            toggleDark,
            customOpenAISettings,
        }
    },
)
