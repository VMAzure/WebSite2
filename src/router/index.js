import { createRouter, createWebHistory } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import NotFoundPage from "../pages/NotFoundPage.vue";

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            redirect: "/default",
        },
        {
            path: "/:slug",
            name: "tenant-home",
            component: HomePage,
            props: true,
        },
        {
            path: "/:pathMatch(.*)*",
            name: "not-found",
            component: NotFoundPage,
        },
    ],
});

export default router;
