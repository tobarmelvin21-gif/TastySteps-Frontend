// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // URL base de Laravel
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export default {
  // Obtener todas las recetas (para el catálogo y filtros)
  getRecetas() {
    return api.get('/recetas');
  },
  // Obtener una receta específica por su ID (para la vista detalle)
  getRecetaById(id: number | string) {
    return api.get(`/recetas/${id}`);
  }
};