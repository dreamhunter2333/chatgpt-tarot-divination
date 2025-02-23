import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Login from '../views/Login.vue'
import Settings from '../views/Settings.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: Index
        },
        { path: '/login', name: 'login', component: Login },
        {
            path: '/login/:login_type',
            name: 'loginCallback',
            query: true,
            component: Login
        },
        {
            path: '/settings',
            component: Settings
        }
    ]
})

export default router
