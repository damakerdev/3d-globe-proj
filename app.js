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

const map = new maplibregl.Map({
    container: 'map',
    // style: 'https://demotiles.maplibre.org/style.json',
    style: './map.json',
    zoom: 2,
    center: [80, 20],
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
        const speed = 0.04;
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

map.on("wheel", stopRotationTemporarily);

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
