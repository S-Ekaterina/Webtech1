// ========================================
// 2. LEAFLET MAP
// ========================================

const pointers = [];
const markers = [];
const selectElement = document.getElementById('point-select');
const pointSelect = document.getElementById('point-select');
const targetSelect = document.getElementById('target-select');
const distanceButton = document.getElementById('distance');
const isErrorText = document.getElementById('if-error-map');
let selectedPoint = "";
let selectedTarget = "";


// map
const map = L.map("map").setView(
    [48.151965, 17.072995],
    15
);
L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }
).addTo(map);

const school = L.marker([48.151965, 17.072995])
    .addTo(map)
    .bindPopup(`<b>FEI STU Bratislava</b>`)
    .openPopup();

const home = L.marker([48.1700724, 17.2127977])
    .addTo(map)
    .bindPopup(`<b>Bydlisko</b>`);
// map



// select pointers
pointers.forEach(pointers => {
    const option = document.createElement('option');
    
    option.value = pointers;
    option.textContent = pointers.name;
    
    selectElement.appendChild(option);
});
// select pointers



// add new marker
let count = pointers.length;
map.on('click', function(e) {
    const markerLat = e.latlng.lat;
    const markerLng = e.latlng.lng;

    const markerName = prompt("Zadajte názov bodu:", "");

    if (markerName) {
        pointers.push({id: count, name: markerName, lat: markerLat, lng: markerLng});
    
        const newMarker = L.marker([markerLat, markerLng])
            .addTo(map)
            .bindPopup(`<b>${markerName}</b>`)
        newMarker.pointName = markerName; 
        markers.push(newMarker);




        const option = document.createElement('option');
        option.value = markerName;
        option.textContent = markerName;

        selectElement.appendChild(option);
        
        count++;

    }
});
// add new marker



//
pointSelect.addEventListener('change', (event) => {
    selectedPoint = event.target.value;
});

targetSelect.addEventListener('change', (event) => {
    selectedTarget = event.target.value;
});
//



// distance between points
const R = 6371;
let polyline = null;
distanceButton.addEventListener('click', function(e){
    if (selectedPoint === "") {
        isErrorText.textContent = 'Zabudli ste vybrat bod';
    }
    else if (selectedTarget === "") {
        isErrorText.textContent = 'Zabudli ste vybrat ciel';
    }
    else {
        isErrorText.textContent = '';
        const pointA = 
            [pointers.find(item => item.name === selectedPoint).lat,
            pointers.find(item => item.name === selectedPoint).lng
            ];
        const markerPoint = markers.find(item => item.pointName === selectedPoint);
        let pointB = [];
        let markerTarget;
        if (selectedTarget === "FEI STU Bratislava") {
            pointB = [48.151965, 17.072995];
            markerTarget = school;
        } 
        else {
            pointB = [48.1700724, 17.2127977];
            markerTarget = home;
        }
        const pointsAB = [pointA, pointB];

        const latRadA = (pointA[0] * Math.PI) / 180;
        const lngRadA = (pointA[1] * Math.PI) / 180;
        const latRadB = (pointB[0] * Math.PI) / 180;
        const lngRadB = (pointB[1] * Math.PI) / 180;
        const distanceInKm = Math.round(
                2 * R * Math.asin(Math.sqrt(
                Math.sin((latRadB-latRadA)/2) * Math.sin((latRadB-latRadA)/2) + 
                Math.cos(latRadA) * Math.cos(latRadB) * 
                Math.sin((lngRadB-lngRadA)/2) * Math.sin((lngRadB-lngRadA)/2)))
                * 100)
                /100;
        markerPoint.setPopupContent(
            `<b>${selectedPoint}</b><br><span>Vzdialenosť: ${distanceInKm} km</span>`);
        markerTarget.setPopupContent(
            `<b>${selectedTarget}</b><br><span>Vzdialenosť: ${distanceInKm} km</span>`);
        
        


        if (polyline) {
            polyline.remove();
        }
        
        polyline = L.polyline(pointsAB, {
            color: '#9e1b22',
            weight: 4,
            opacity: 1,
            dashArray: '10, 5'
        }).addTo(map);

        
        map.fitBounds(polyline.getBounds());

        markerTarget.openPopup();
    }
});
// distance between points
