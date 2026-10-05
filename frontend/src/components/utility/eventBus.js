import { ref } from 'vue';
import { authFetch } from './router';

const API_URL = import.meta.env.VITE_API_URL;

const filters = {
  filters: ref([]),
  updateFilters(newFilters) {
    this.filters.value = newFilters;
  }
};

const zones = {
  zoneList: ref([]),
  async updateZones() {
    return await authFetch(`${API_URL}/api/zones`, {
        method: "GET",
        headers: { "x-access-token": localStorage.getItem("JWT") }
    })
    .then((res) => {
        //console.log(res);
        if (!res.ok) {
            throw new Error(`Error: ${res.status} ${res.statusText}`);
        }
        return res.json(); 
    })
    .then((data) => {
        this.zoneList.value = data;
        return data;
    })
    .catch((error) => {
        console.error("authFetch error:", error);
    });
  }
}

export default {filters,zones};