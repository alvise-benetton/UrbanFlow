let listaZone = [];
let listaEventi = [];
let listaMisurazioni = [];


async function updateZones() {
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
        listaZone = data;
        //console.log(listaZone);
        return data;
    })
    .catch((error) => {
        console.error("Fetch error:", error);
    });
}

export default {updateZones,listaZone};
