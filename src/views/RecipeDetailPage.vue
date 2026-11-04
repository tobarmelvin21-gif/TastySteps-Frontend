<template>
  <ion-page class="detail-page">
    <ion-header class="detail-header">
      <ion-toolbar>
        <div class="topbar">
          <a class="brand" href="/catalog">TastySteps</a>
          <nav class="top-navigation" aria-label="Navegación principal">
            <a href="/catalog">Recetas</a>
            <a href="/catalog#categories">Categorías</a>
          </nav>
          <ion-searchbar
            v-model="searchText"
            class="detail-search"
            placeholder="Buscar por receta o ingrediente"
            aria-label="Buscar por receta o ingrediente"
            @keyup.enter="searchCatalog"
          />
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content class="detail-content">
      <main v-if="recipe" class="detail-main">
        <a class="back-link" href="/catalog">← Volver al catálogo</a>

        <section class="recipe-overview">
          <!-- Si la API provee imagen, la muestra con fondo; si no, mantiene tu texto de diseño -->
          <div
            class="recipe-image"
            :style="
              recipe.image
                ? `background-image: url(${recipe.image}); background-size: cover; background-position: center;`
                : ''
            "
          >
            <span v-if="!recipe.image">Foto del platillo</span>
          </div>
          <div class="recipe-heading">
            <span class="recipe-category">{{ recipe.category }}</span>
            <h1>{{ recipe.title }}</h1>
            <p class="recipe-description">{{ recipe.description }}</p>
            <div class="recipe-stats" aria-label="Información de la receta">
              <div>
                <strong>{{ recipe.time }} min</strong>
                <span>Tiempo</span>
              </div>
              <div>
                <strong>{{ recipe.difficulty }}</strong>
                <span>Dificultad</span>
              </div>
              <div>
                <strong>{{ recipe.servings || recipe.portions }}</strong>
                <span>Porciones</span>
              </div>
            </div>
          </div>
        </section>

        <section class="recipe-instructions">
          <div class="ingredients-panel">
            <h2>Ingredientes</h2>
            <label v-for="(ingredient, index) in recipe.ingredients" :key="index" class="ingredient">
              <input v-model="checkedIngredients" type="checkbox" :value="ingredient" />
              <span>{{ ingredient }}</span>
            </label>
          </div>

          <div class="preparation-panel">
            <h2>Preparación</h2>
            <ol class="steps-list">
              <li v-for="(step, index) in recipe.steps" :key="index">
                <span class="step-number">{{ index + 1 }}</span>
                <span>{{ step }}</span>
              </li>
            </ol>
          </div>
        </section>
      </main>
      <main v-else class="not-found">
        <h1>Receta no encontrada</h1>
        <a class="back-link" href="/catalog">← Volver al catálogo</a>
      </main>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonContent, IonHeader, IonPage, IonSearchbar, IonToolbar } from '@ionic/vue';
import api from '@/services/api';

interface Recipe {
  title: string;
  category: string;
  description: string;
  time: number | string;
  difficulty: string;
  servings?: number | string;
  portions?: number | string;
  image?: string;
  ingredients: string[];
  steps: string[];
}

const route = useRoute();
const router = useRouter();
const searchText = ref('');
const checkedIngredients = ref<string[]>([]);
const recipe = ref<Recipe | null>(null);

const normalizeList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map(String);
  }

  if (typeof value !== 'string' || value.length === 0) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }
  } catch {
    // Plain text is also accepted as a single item.
  }

  return [value];
};

// Consumir el endpoint GET /api/recetas/{id} de Laravel al montar el componente
onMounted(async () => {
  try {
    const id = route.params.id;
    if (typeof id !== 'string') {
      throw new Error('El identificador de la receta no es válido.');
    }

    const response = await api.getRecetaById(id);
    recipe.value = {
      ...response.data,
      ingredients: normalizeList(response.data.ingredients),
      steps: normalizeList(response.data.steps),
    };
  } catch (error) {
    console.error('Error al obtener el detalle de la receta desde la API:', error);
  }
});

const searchCatalog = () => {
  const search = searchText.value.trim();
  router.push({ path: '/search', query: search ? { search } : {} });
};
</script>

<style scoped>
.detail-page {
  --page-background: #fafaf8;
  --ink: #26332e;
  --muted: #727a75;
  --accent: #c9371d;
  color: var(--ink);
}

.detail-header ion-toolbar {
  --background: #fff;
  --border-color: #ecece8;
  --min-height: 62px;
  border-bottom: 1px solid #ecece8;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  width: min(100% - 48px, 946px);
  margin: 0 auto;
}

.brand {
  flex: 0 0 auto;
  color: var(--accent);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 22px;
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
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
}

.detail-search {
  min-height: 34px;
  padding: 0;
  --background: #fff;
  --border-radius: 999px;
  --box-shadow: inset 0 0 0 1px #deded9;
  --color: var(--ink);
  --icon-color: transparent;
  --placeholder-color: #828680;
  --placeholder-opacity: 1;
  font-size: 12px;
}

.detail-content {
  --background: var(--page-background);
}

.detail-main,
.not-found {
  width: min(100% - 48px, 870px);
  margin: 0 auto;
  padding: 34px 0 26px;
}

.back-link {
  display: inline-block;
  margin-bottom: 16px;
  color: #34413b;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
}

.back-link:hover {
  color: var(--accent);
}

.recipe-overview {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
  margin-bottom: 30px;
}

.recipe-image {
  display: grid;
  min-height: 240px;
  place-items: center;
  border-radius: 10px;
  background: #e9e5d9;
  color: #747a72;
  font-size: 13px;
}

.recipe-heading {
  padding-top: 2px;
}

.recipe-category {
  color: var(--muted);
  font-size: 12px;
}

.recipe-heading h1 {
  margin: 3px 0 13px;
  color: #202c27;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(29px, 4vw, 35px);
  line-height: 1.15;
}

.recipe-description {
  margin: 0 0 14px;
  color: var(--muted);
  font-size: 13px;
}

.recipe-stats {
  display: flex;
  gap: 20px;
}

.recipe-stats div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.recipe-stats strong {
  color: #303b36;
  font-size: 13px;
}

.recipe-stats span {
  color: var(--muted);
  font-size: 11px;
}

.recipe-instructions {
  display: grid;
  grid-template-columns: 0.62fr 1.08fr;
  gap: 32px;
  align-items: start;
}

.ingredients-panel {
  padding: 19px 18px 17px;
  border: 1px solid #e8e8e3;
  border-radius: 10px;
  background: #fff;
}

.ingredients-panel h2,
.preparation-panel h2 {
  margin: 0 0 13px;
  color: #303b36;
  font-size: 19px;
  font-weight: 700;
}

.ingredient {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 9px 2px;
  color: #39433e;
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
}

.ingredient input {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  margin: 2px 0 0;
  accent-color: var(--accent);
}

.preparation-panel h2 {
  margin: 0 0 12px;
}

.steps-list {
  display: grid;
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.steps-list li {
  display: flex;
  min-height: 50px;
  align-items: flex-start;
  gap: 12px;
  padding: 13px 12px;
  border: 1px solid #e8e8e3;
  border-radius: 10px;
  background: #fff;
  color: #39433e;
  font-size: 13px;
  line-height: 1.35;
}

.step-number {
  flex: 0 0 16px;
  color: var(--accent);
  font-size: 17px;
  font-weight: 700;
  line-height: 1;
}

.not-found h1 {
  margin: 0 0 12px;
  font-family: Georgia, 'Times New Roman', serif;
}

@media (max-width: 640px) {
  .topbar {
    flex-wrap: wrap;
    gap: 12px 18px;
    width: calc(100% - 32px);
    padding: 9px 0;
  }

  .detail-header ion-toolbar {
    --min-height: 0;
  }

  .top-navigation {
    gap: 16px;
  }

  .detail-search {
    flex: 1 0 100%;
    min-height: 32px;
  }

  .detail-main,
  .not-found {
    width: calc(100% - 32px);
    padding-top: 24px;
  }

  .recipe-overview,
  .recipe-instructions {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .recipe-overview {
    margin-bottom: 24px;
  }

  .recipe-image {
    min-height: 210px;
  }

  .ingredients-panel {
    padding: 17px 16px 14px;
  }
}
</style>
