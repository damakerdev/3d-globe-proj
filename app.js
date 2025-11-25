const locations = [
    // {
    // coords: [longitude, latitude],
    // text: "Popup text here"
    // },
    {
        coords: [-77.0353, 38.8895],
        text: "Washington Monument — Built in 1848."
    },
    {
        coords: [2.2945, 48.8584],
        text: "Eiffel Tower — Built in 1889."
    },
    {
        coords: [139.6917, 35.6895],
        text: "Tokyo — Capital of Japan."
    },
    {
        coords: [151.2153, -33.8568],
        text: "Sydney Opera House — Opened in 1973."
    },
    {
        coords: [85.3240, 27.7172],
        text: "Kathmandu - Capital of Nepal."
    }
];

// const map = new maplibregl.Map({
//     container: 'map',
//     zoom: 0,
//     center: [137.9150899566626, 36.25956997955441],
//     // style: 'https://demotiles.maplibre.org/style.json',
//     // style: "https://api.protomaps.com/styles/v5/light/en.json?key=d6d2a44f6f976d85",
//     style: "https://cdn.jsdelivr.net/gh/openmaptiles/osm-bright-gl-style@v1.11/style.json"

// });

const map = new maplibregl.Map({
    container: 'map',
    style: {
        version: 8,
        sources: {
            'satellite': {
                type: 'raster',
                tiles: [
                    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                ],
                tileSize: 256,
                attribution: '&copy; Esri, Earthstar Geographics'
            }
        },
        layers: [
            {
                id: 'background',
                type: 'background',
                paint: {
                    'background-color': '#020409'
                }
            },
            {
                id: 'satellite-layer',
                type: 'raster',
                source: 'satellite',
                paint: {
                    'raster-opacity': 1,
                    'raster-fade-duration': 300
                }
            }
        ]
    },
    center: [-98, 39],
    zoom: 1.5,
    projection: 'globe',
    attributionControl: false
});


map.on('style.load', () => {
    map.setProjection({
        type: 'globe',
    });
});

// ------------------------------
// AUTO ROTATION + USER CONTROL
// ------------------------------

let userInteracting = false;
let lastInteractionTime = 0;
let popupOpen = false;

function rotateGlobe() {
    const now = Date.now();

    // rotate ONLY if user is not controlling it,
    // popup is not open, and 2 sec passed after they stop
    if (!userInteracting && !popupOpen && now - lastInteractionTime > 150) {
        const speed = -0.02;
        const c = map.getCenter();
        map.setCenter([c.lng + speed, c.lat]);
    }

    requestAnimationFrame(rotateGlobe);
}

function stopRotationTemporarily() {
    userInteracting = true;
    lastInteractionTime = Date.now();
}

function resumeRotationSoon() {
    userInteracting = false;
    lastInteractionTime = Date.now();
}

// --- USER INTERACTION EVENTS ---
map.on("mousedown", stopRotationTemporarily);
map.on("mouseup", resumeRotationSoon);

map.on("dragstart", stopRotationTemporarily);
map.on("dragend", resumeRotationSoon);

// ADD: The following 4 lines to handle zooming and tilting (pitch) correctly
map.on("zoomstart", stopRotationTemporarily);
map.on("zoomend", resumeRotationSoon);
map.on("pitchstart", stopRotationTemporarily);
map.on("pitchend", resumeRotationSoon);

map.on("touchstart", stopRotationTemporarily);
map.on("touchend", resumeRotationSoon);


// Start rotating
// map.on("load", () => {
//     rotateGlobe();
// });

map.on('load', () => {
    map.loadImage('./image/space.jpg', (error, image) => {
        if (error) throw error;

        map.addImage('stars', image);

        // Add background layer with the star image
        map.addLayer({
            id: 'space-background',
            type: 'background',
            paint: {
                'background-pattern': 'stars'
            }
        });
    });

    rotateGlobe(); // start rotation


});

// ------------------------------
// MULTIPLE MARKERS + POPUPS
// ------------------------------

locations.forEach(loc => {
    const popup = new maplibregl.Popup({ offset: 25 })
        .setText(loc.text);

    popup.on('open', () => {
        popupOpen = true;
        stopRotationTemporarily();
    });

    popup.on('close', () => {
        popupOpen = false;
        resumeRotationSoon();
    });

    const el = document.createElement('div');
    el.id = 'marker';

    new maplibregl.Marker({ element: el })
        .setLngLat(loc.coords)
        .setPopup(popup)
        .addTo(map);
});


