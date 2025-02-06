import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCameraDataStore = defineStore('cameraData', () => {
    const listaMisurazioni = ref([]); // Lista delle zone (reattiva)

    // Metodo per aggiornare la lista delle zone
    async function updateCameraData() {
        try {
            const response = await fetch('http://localhost:3000/api/cameraData', {
                method: 'GET',
                headers: { 'x-access-token': localStorage.getItem('JWT') },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            listaMisurazioni.value = data; // Aggiorna la lista delle zone
            console.log('Lista misurazioni aggiornata:', listaMisurazioni.value);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
    return {
        listaMisurazioni,
        updateCameraData,
    };
});