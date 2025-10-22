import { ref } from "vue";
import {
    createGlobalState, useDark, useToggle, useLocalStorage
} from '@vueuse/core'

export const useGlobalState = createGlobalState(
    () => {
        const isDark = useDark()
        const toggleDark = useToggle(isDark)
        const loading = ref(false);
        const settings = ref({
            fetched: false,
            error: null
        });
        const customOpenAISettings = useLocalStorage('customOpenAISettingsStorage', {
            enable: false,
            baseUrl: '',
            apiKey: '',
            model: '',
        });
        return {
            isDark,
            toggleDark,
            settings,
            customOpenAISettings,
        }
    },
)
