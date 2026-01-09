import { createRouter, createWebHistory } from "vue-router"

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../pages/HomePage.vue")
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("../pages/NotFoundPage.vue")
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
