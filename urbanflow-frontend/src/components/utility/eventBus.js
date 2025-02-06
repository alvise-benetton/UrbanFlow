import { ref } from 'vue';

const filters = {
  filters: ref([]),
  updateFilters(newFilters) {
    this.filters.value = newFilters;
  }
};

const zones = {
  zoneList: ref([]),
  async updateZones() {
    return await fetch("http://localhost:3000/api/zones", {
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
        console.error("Fetch error:", error);
    });
  }
}

export default {filters,zones};