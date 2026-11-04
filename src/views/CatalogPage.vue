<template>
    <ion-page class="catalog-page">
        <ion-header class="catalog-header">
            <ion-toolbar>
                <div class="topbar">
                    <a class="brand" href="/catalog">TastySteps</a>
                    <nav class="top-navigation" aria-label="Navegación principal">
                        <a href="/catalog">Recetas</a>
                        <a href="#categories">Categorías</a>
                    </nav>
                    <ion-searchbar v-model="searchText" class="catalog-search"
                        placeholder="Buscar por receta o ingrediente" aria-label="Buscar por receta o ingrediente"
                        @keyup.enter="goToSearch" />
                </div>
            </ion-toolbar>
        </ion-header>

        <ion-content class="catalog-content">
            <main class="catalog-main">
                <section class="intro">
                    <h1>¿Qué vas a cocinar hoy?</h1>
                    <p>Ingredientes exactos y pasos claros, sin distracciones.</p>
                </section>

                <div id="categories" class="category-list" aria-label="Filtrar por categoría">
                    <button v-for="category in categories" :key="category" class="category-button"
                        :class="{ 'is-selected': selectedCategory === category }"
                        :aria-pressed="selectedCategory === category" @click="selectedCategory = category">
                        {{ category }}
                    </button>
                </div>

                <ion-grid class="recipe-grid">
                    <ion-row>
                        <ion-col v-for="recipe in filteredRecipes" :key="recipe.id" size="12" size-sm="6" size-lg="4">
                            <button class="recipe-card" type="button" :aria-label="`Ver receta: ${recipe.title}`"
                                @click="goToDetail(recipe.id)">
                                <!-- Muestra la imagen de la API si existe, de lo contrario mantiene tu estructura visual -->
                                <div class="recipe-image"
                                    :style="recipe.image ? `background-image: url(${recipe.image}); background-size: cover; background-position: center;` : ''">
                                    <span v-if="!recipe.image">Foto del platillo</span>
                                </div>
                                <div class="recipe-info">
                                    <span class="recipe-category">{{ recipe.category }}</span>
                                    <h2>{{ recipe.title }}</h2>
                                    <p>{{ recipe.time }} min · {{ recipe.difficulty }}</p>
                                </div>
                            </button>
                        </ion-col>
                    </ion-row>
                </ion-grid>
            </main>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonSearchbar, IonToolbar } from '@ionic/vue';
import api from '@/services/api';

const router = useRouter();
const route = useRoute();
const searchText = ref(typeof route.query.search === 'string' ? route.query.search : '');
const selectedCategory = ref('Todas');
const categories = ['Todas', 'Desayunos', 'Almuerzos', 'Cenas', 'Postres'];

const recipes = ref<any[]>([]);

// Consumir la API de Laravel al montar el componente
onMounted(async () => {
    try {
        const response = await api.getRecetas();
        recipes.value = response.data;
    } catch (error) {
        console.error('Error al cargar las recetas desde la API:', error);
    }
});

watch(
    () => route.query.search,
    (search) => {
        searchText.value = typeof search === 'string' ? search : '';
    },
);

const filteredRecipes = computed(() => {
    return recipes.value.filter((recipe) => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchText.value.toLowerCase());
        const matchesCategory = selectedCategory.value === 'Todas' || recipe.category === selectedCategory.value;
        return matchesSearch && matchesCategory;
    });
});

const goToDetail = (id: number) => {
    router.push(`/recipe/${id}`);
};

const goToSearch = () => {
    const search = searchText.value.trim();
    router.push({ path: '/search', query: search ? { search } : {} });
};
</script>

<style scoped>
.catalog-page {
    --page-background: #fafaf8;
    --ink: #26332e;
    --muted: #727a75;
    --accent: #c9371d;
    color: var(--ink);
}

.catalog-header ion-toolbar {
    --background: #fff;
    --border-color: #ecece8;
    --min-height: 64px;
    border-bottom: 1px solid #ecece8;
}

.topbar {
    display: flex;
    align-items: center;
    gap: 24px;
    width: min(100% - 48px, 994px);
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

.catalog-search {
    min-height: 36px;
    padding: 0;
    --background: #fff;
    --border-radius: 999px;
    --box-shadow: inset 0 0 0 1px #deded9;
    --color: var(--ink);
    --icon-color: transparent;
    --placeholder-color: #828680;
    --placeholder-opacity: 1;
    font-size: 13px;
}

.catalog-content {
    --background: var(--page-background);
}

.catalog-main {
    width: min(100% - 48px, 922px);
    margin: 0 auto;
    padding: 32px 0 48px;
}

.intro {
    margin-bottom: 18px;
}

.intro h1 {
    margin: 0 0 4px;
    color: #202c27;
    font-family: Georgia, 'Times New Roman', serif;
    font-size: clamp(30px, 4vw, 36px);
    font-weight: 700;
    line-height: 1.2;
}

.intro p {
    margin: 0;
    color: var(--muted);
    font-size: 14px;
}

.category-list {
    display: flex;
    gap: 9px;
    margin-bottom: 26px;
    overflow-x: auto;
    scrollbar-width: none;
}

.category-list::-webkit-scrollbar {
    display: none;
}

.category-button {
    flex: 0 0 auto;
    min-height: 38px;
    padding: 0 16px;
    border: 1px solid #deded9;
    border-radius: 9px;
    background: #fff;
    color: #333c37;
    font: inherit;
    font-size: 13px;
    font-weight: 650;
    cursor: pointer;
}

.category-button.is-selected {
    border-color: var(--accent);
    background: var(--accent);
    color: #fff;
}

.recipe-grid {
    padding: 0;
}

.recipe-grid ion-row {
    margin: 0 -10px;
}

.recipe-grid ion-col {
    padding: 0 10px 20px;
}

.recipe-card {
    display: block;
    width: 100%;
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
    height: 144px;
    place-items: center;
    background: #e9e5d9;
    color: #747a72;
    font-size: 13px;
}

.recipe-info {
    padding: 12px 13px 13px;
}

.recipe-category {
    display: block;
    margin-bottom: 3px;
    color: var(--muted);
    font-size: 12px;
}

.recipe-info h2 {
    margin: 0 0 6px;
    color: #303b36;
    font-size: 15px;
    font-weight: 700;
    line-height: 1.25;
}

.recipe-info p {
    margin: 0;
    color: var(--muted);
    font-size: 13px;
}

@media (max-width: 640px) {
    .topbar {
        flex-wrap: wrap;
        gap: 12px 18px;
        width: calc(100% - 32px);
        padding: 10px 0;
    }

    .catalog-header ion-toolbar {
        --min-height: 0;
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

    .catalog-search {
        flex: 1 0 100%;
        min-height: 32px;
    }

    .catalog-main {
        width: calc(100% - 32px);
        padding-top: 26px;
    }

    .recipe-grid ion-row {
        margin: 0 -7px;
    }

    .recipe-grid ion-col {
        padding: 0 7px 14px;
    }

    .recipe-image {
        height: 130px;
    }
}
</style>