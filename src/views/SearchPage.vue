<template>
  <ion-page class="search-page">
    <ion-header class="search-header">
      <ion-toolbar>
        <div class="topbar">
          <a class="brand" href="/catalog">TastySteps</a>
          <nav class="top-navigation" aria-label="Navegación principal">
            <a href="/catalog">Recetas</a>
            <a href="/catalog#categories">Categorías</a>
          </nav>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="search-content">
      <main class="search-main">
        <h1>Buscar recetas</h1>
        <form class="search-form" role="search" @submit.prevent="applyFilters">
          <input
            v-model="searchText"
            class="search-input"
            type="search"
            placeholder="Ingrediente o nombre del platillo"
            aria-label="Ingrediente o nombre del platillo"
          />
        </form>

        <div class="search-layout">
          <form class="filters-panel" @submit.prevent="applyFilters">
            <h2>Filtros</h2>

            <label class="filter-field">
              <span>Categoría</span>
              <select v-model="category">
                <option value="Todas">Todas</option>
                <option v-for="item in categories" :key="item" :value="item">{{ item }}</option>
              </select>
            </label>

            <label class="filter-field">
              <span>Dificultad</span>
              <select v-model="difficulty">
                <option value="Todas">Todas</option>
                <option v-for="item in difficulties" :key="item" :value="item">{{ item }}</option>
              </select>
            </label>

            <label class="filter-field">
              <span>Tiempo máximo</span>
              <select v-model="maxTime">
                <option value="0">Cualquiera</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
              </select>
            </label>

            <button class="apply-button" type="submit">Aplicar filtros</button>
            <button class="clear-button" type="button" @click="clearFilters">Limpiar</button>
          </form>

          <section class="results" aria-live="polite">
            <p class="result-count">
              {{ filteredRecipes.length }} resultado{{ filteredRecipes.length === 1 ? '' : 's' }}
              <template v-if="appliedSearch"> para “{{ appliedSearch }}”</template>
            </p>

            <div v-if="filteredRecipes.length" class="recipe-grid">
              <button
                v-for="recipe in filteredRecipes"
                :key="recipe.id"
                class="recipe-card"
                type="button"
                :aria-label="`Ver receta: ${recipe.title}`"
                @click="goToDetail(recipe.id)"
              >
                <div class="recipe-image">Foto del platillo</div>
                <div class="recipe-info">
                  <span class="recipe-category">{{ recipe.category }}</span>
                  <h2>{{ recipe.title }}</h2>
                  <p>{{ recipe.time }} · {{ recipe.difficulty }}</p>
                </div>
              </button>
            </div>
            <p v-else class="empty-state">
              No encontramos recetas con esos criterios. Prueba cambiar la búsqueda o los filtros.
            </p>
          </section>
        </div>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonContent, IonHeader, IonPage, IonToolbar } from '@ionic/vue';

interface Recipe {
  id: number;
  title: string;
  category: string;
  time: number;
  difficulty: string;
  description: string;
  ingredients: string[];
}

const route = useRoute();
const router = useRouter();
const categories = ['Desayunos', 'Almuerzos', 'Cenas', 'Postres'];
const difficulties = ['Fácil', 'Media', 'Difícil'];

const recipes: Recipe[] = [
  {
    id: 1,
    title: 'Pupusas de queso',
    category: 'Almuerzos',
    time: 40,
    difficulty: 'Fácil',
    description: 'Tortillas de maíz rellenas de queso.',
    ingredients: ['harina de maíz', 'queso mozzarella', 'sal'],
  },
  {
    id: 2,
    title: 'Pasta al pomodoro',
    category: 'Cenas',
    time: 25,
    difficulty: 'Fácil',
    description: 'Pasta con tomate y albahaca.',
    ingredients: ['pasta', 'tomate', 'albahaca'],
  },
  {
    id: 3,
    title: 'Sopa de pollo',
    category: 'Almuerzos',
    time: 60,
    difficulty: 'Media',
    description: 'Sopa casera de pollo con verduras.',
    ingredients: ['pollo', 'zanahoria', 'papas', 'caldo'],
  },
  {
    id: 4,
    title: 'Panqueques',
    category: 'Desayunos',
    time: 20,
    difficulty: 'Fácil',
    description: 'Panqueques esponjosos para el desayuno.',
    ingredients: ['harina', 'leche', 'huevo', 'azúcar'],
  },
  {
    id: 5,
    title: 'Tacos de pollo',
    category: 'Cenas',
    time: 35,
    difficulty: 'Media',
    description: 'Tacos de pollo con verduras frescas.',
    ingredients: ['pollo', 'tortillas', 'tomate', 'cilantro'],
  },
  {
    id: 6,
    title: 'Pastel de chocolate',
    category: 'Postres',
    time: 90,
    difficulty: 'Difícil',
    description: 'Pastel de chocolate suave.',
    ingredients: ['harina', 'chocolate', 'huevo', 'leche'],
  },
  {
    id: 7,
    title: 'Pollo al horno',
    category: 'Cenas',
    time: 50,
    difficulty: 'Fácil',
    description: 'Pollo horneado con hierbas y verduras.',
    ingredients: ['pollo', 'papas', 'romero', 'aceite de oliva'],
  },
];

const searchText = ref('');
const appliedSearch = ref('');
const category = ref('Todas');
const difficulty = ref('Todas');
const maxTime = ref('0');
const appliedCategory = ref('Todas');
const appliedDifficulty = ref('Todas');
const appliedMaxTime = ref(0);

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const readQuery = () => {
  const query = route.query;
  searchText.value = typeof query.search === 'string' ? query.search : '';
  appliedSearch.value = searchText.value.trim();

  const queryCategory = typeof query.category === 'string' ? query.category : 'Todas';
  category.value = categories.includes(queryCategory) ? queryCategory : 'Todas';
  appliedCategory.value = category.value;

  const queryDifficulty = typeof query.difficulty === 'string' ? query.difficulty : 'Todas';
  difficulty.value = difficulties.includes(queryDifficulty) ? queryDifficulty : 'Todas';
  appliedDifficulty.value = difficulty.value;

  const parsedMaxTime = Number(query.maxTime);
  maxTime.value = ['30', '45', '60'].includes(String(parsedMaxTime)) ? String(parsedMaxTime) : '0';
  appliedMaxTime.value = Number(maxTime.value);
};

watch(() => route.query, readQuery, { immediate: true });

const filteredRecipes = computed(() => {
  const search = normalize(appliedSearch.value);
  return recipes.filter((recipe) => {
    const searchableText = normalize(
      [recipe.title, recipe.category, recipe.description, ...recipe.ingredients].join(' '),
    );
    return (
      (!search || searchableText.includes(search)) &&
      (appliedCategory.value === 'Todas' || recipe.category === appliedCategory.value) &&
      (appliedDifficulty.value === 'Todas' || recipe.difficulty === appliedDifficulty.value) &&
      (!appliedMaxTime.value || recipe.time <= appliedMaxTime.value)
    );
  });
});

const applyFilters = () => {
  appliedSearch.value = searchText.value.trim();
  appliedCategory.value = category.value;
  appliedDifficulty.value = difficulty.value;
  appliedMaxTime.value = Number(maxTime.value);

  const query: Record<string, string> = {};
  if (appliedSearch.value) query.search = appliedSearch.value;
  if (appliedCategory.value !== 'Todas') query.category = appliedCategory.value;
  if (appliedDifficulty.value !== 'Todas') query.difficulty = appliedDifficulty.value;
  if (appliedMaxTime.value) query.maxTime = String(appliedMaxTime.value);
  router.replace({ path: '/search', query });
};

const clearFilters = () => {
  searchText.value = '';
  category.value = 'Todas';
  difficulty.value = 'Todas';
  maxTime.value = '0';
  applyFilters();
};

const goToDetail = (id: number) => {
  router.push(`/recipe/${id}`);
};
</script>

<style scoped>
.search-page {
  --page-background: #fafaf8;
  --ink: #26332e;
  --muted: #727a75;
  --accent: #c9371d;
  color: var(--ink);
}

.search-header ion-toolbar {
  --background: #fff;
  --border-color: #ecece8;
  --min-height: 62px;
  border-bottom: 1px solid #ecece8;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  width: min(100% - 48px, 1070px);
  margin: 0 auto;
}

.brand {
  flex: 0 0 auto;
  color: var(--accent);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 23px;
  font-weight: 700;
  text-decoration: none;
}

.top-navigation {
  display: flex;
  flex: 0 0 auto;
  gap: 22px;
}

.top-navigation a {
  color: #333c37;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
}

.search-content {
  --background: var(--page-background);
}

.search-main {
  width: min(100% - 48px, 1045px);
  margin: 0 auto;
  padding: 38px 0 40px;
}

.search-main > h1 {
  margin: 0 0 18px;
  color: #202c27;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(32px, 4vw, 39px);
  line-height: 1.15;
}

.search-form {
  margin-bottom: 22px;
}

.search-input {
  width: 100%;
  height: 39px;
  padding: 0 13px;
  border: 1px solid #deded9;
  border-radius: 9px;
  outline: none;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 15px;
}

.search-input:focus,
.filter-field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 2px rgb(201 55 29 / 12%);
}

.search-input::placeholder {
  color: #838781;
}

.search-layout {
  display: grid;
  grid-template-columns: 298px minmax(0, 1fr);
  gap: 38px;
  align-items: start;
}

.filters-panel {
  display: grid;
  gap: 16px;
  padding: 22px 22px 21px;
  border: 1px solid #e8e8e3;
  border-radius: 11px;
  background: #fff;
}

.filters-panel h2 {
  margin: 0 -0px 2px;
  color: #303b36;
  font-size: 19px;
  font-weight: 700;
}

.filter-field {
  display: grid;
  gap: 6px;
  color: #333c37;
  font-size: 13px;
  font-weight: 600;
}

.filter-field select {
  width: 100%;
  height: 34px;
  padding: 0 12px;
  border: 1px solid #d9d9d3;
  border-radius: 9px;
  background: #fff;
  color: #303b36;
  font: inherit;
  font-size: 13px;
}

.apply-button,
.clear-button {
  min-height: 43px;
  border: 1px solid transparent;
  border-radius: 9px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.apply-button {
  margin-top: 1px;
  background: var(--accent);
  color: #fff;
}

.apply-button:hover {
  background: #b83019;
}

.clear-button {
  border-color: #deded9;
  background: #fff;
  color: #303b36;
}

.clear-button:hover {
  background: #f7f7f4;
}

.result-count {
  margin: 1px 0 14px;
  color: var(--muted);
  font-size: 13px;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.recipe-card {
  display: block;
  min-width: 0;
  overflow: hidden;
  padding: 0;
  border: 1px solid #e8e8e3;
  border-radius: 11px;
  background: #fff;
  color: var(--ink);
  text-align: left;
  cursor: pointer;
  transition:
    box-shadow 150ms ease,
    transform 150ms ease;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 16px rgb(38 51 46 / 8%);
}

.recipe-image {
  display: grid;
  height: 145px;
  place-items: center;
  background: #e9e5d9;
  color: #747a72;
  font-size: 13px;
}

.recipe-info {
  padding: 12px 14px 14px;
}

.recipe-category {
  display: block;
  margin-bottom: 3px;
  color: var(--muted);
  font-size: 12px;
}

.recipe-info h2 {
  margin: 0 0 7px;
  color: #303b36;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
}

.recipe-info p {
  margin: 0;
  color: var(--muted);
  font-size: 13px;
}

.empty-state {
  padding: 22px;
  border: 1px solid #e8e8e3;
  border-radius: 10px;
  background: #fff;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

@media (max-width: 850px) {
  .search-layout {
    grid-template-columns: 240px minmax(0, 1fr);
    gap: 22px;
  }

  .recipe-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }
}

@media (max-width: 620px) {
  .topbar {
    gap: 18px;
    width: calc(100% - 32px);
  }

  .brand {
    font-size: 21px;
  }

  .top-navigation {
    gap: 16px;
  }

  .top-navigation a {
    font-size: 13px;
  }

  .search-main {
    width: calc(100% - 32px);
    padding-top: 27px;
  }

  .search-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .filters-panel {
    gap: 13px;
    padding: 18px;
  }

  .recipe-grid {
    grid-template-columns: 1fr;
  }

  .recipe-image {
    height: 160px;
  }
}
</style>
