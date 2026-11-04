// src/router/index.ts
import { createRouter, createWebHistory } from '@ionic/vue-router';
import type { RouteRecordRaw } from 'vue-router';

import CatalogPage from '@/views/CatalogPage.vue';
import RecipeDetailPage from '@/views/RecipeDetailPage.vue';
import SearchPage from '@/views/SearchPage.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/catalog' },
  { path: '/catalog', component: CatalogPage },
  { path: '/search', component: SearchPage },
  { path: '/recipe/:id', component: RecipeDetailPage },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
