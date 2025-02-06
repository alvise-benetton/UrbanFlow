import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useZoneStore = defineStore('zone', () => {
    const listaZone = ref([]); // Lista delle zone (reattiva)

    // Metodo per aggiornare la lista delle zone
    async function updateZones() {
        try {
            const response = await fetch('http://localhost:3000/api/zones', {
                method: 'GET',
                headers: { 'x-access-token': localStorage.getItem('JWT') },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            listaZone.value = data; // Aggiorna la lista delle zone
            console.log('Lista zone aggiornata:', listaZone.value);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
    return {
        listaZone,
        updateZones,
    };
});