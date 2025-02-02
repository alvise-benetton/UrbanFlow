import { ref } from 'vue';

const eventBus = {
  filters: ref([]),
  updateFilters(newFilters) {
    this.filters.value = newFilters;
  }
};

export default eventBus;