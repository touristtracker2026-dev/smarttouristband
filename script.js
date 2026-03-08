javascript
const TRACCAR_CONFIG = {
    server: 'https://demo.traccar.org',
    email: 'tourist.tracker2026@gmail.com',
    password: 'tourist12345',
    deviceId: null,
    updateInterval: 10000
};

const touristPlaces = [
    {
        name: "قلعة نزوى",
        lat: 22.9333,
        lon: 57.5333,
        description: "قلعة نزوى من أبرز المعالم التاريخية في سلطنة عمان. بُنيت في القرن السابع عشر.",
        image: "https://images.unsplash.com/photo-1612626256634-991e6e977fc1?w=800&q=80"
    },
    {
        name: "جامع السلطان قابوس الأكبر",
        lat: 23.5839,
        lon: 58.3886,
        description: "أحد أجمل المساجد في العالم، يتميز بتصميمه المعماري الفريد.",
        image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80"
    },
    {
        name: "سوق مطرح",
        lat: 23.6237,
        lon: 58.5648,
        description: "سوق تقليدي يعود تاريخه لمئات السنين، يشتهر بالبخور العماني.",
        image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80"
    },
    {
        name: "وادي شاب",
        lat: 22.8383,
        lon: 59.2456,
        description: "واحد من أجمل الوديان في عمان، يتميز بالبرك الزرقاء الصافية.",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
    }
];

let map;
let userMarker;
let userCircle;
let placeMarkers = [];
let currentPosition = { lat: 0, lon: 0 };
let notificationDistance = 1000;
let notifiedPlaces = [];
let updateInterval = null;
let isConnected = false;

function initMap() {
    map = L.map('map').setView([23.5859, 58.4059], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    touristPlaces.forEach(place => {
        const marker = L.marker([place.lat, place.lon]).addTo(map);
        marker.bindPopup(`<div style="text-align: center;"><h3>${place.name}</h3><p>${place.description.substring(0, 80)}...</p></div>`);
        placeMarkers.push(marker);
    });
}

async function loginToTraccar() {
    try {
        const response = await fetch(`${TRACCAR_CONFIG.server}/api/session`, {
            method: 'POST',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            body: `email=${encodeURIComponent(TRACCAR_CONFIG.email)}&password=${encodeURIComponent(TRACCAR_CONFIG.password)}`,
            credentials: 'include'
        });
        if (response.ok) {
            console.log('✅ تم تسجيل الدخول بنجاح');
            return true;
        }
        console.error('❌ فشل تسجيل الدخول:', response.status);
        return false;
    } catch (error) {
        console.error('❌ خطأ:', error);
        return false;
    }
}

async function getDevices() {
    try {
        const response = await fetch(`${TRACCAR_CONFIG.server}/api/devices`, {credentials: 'include'});
        if (response.ok) {
            const devices = await response.json();
            if (devices.length > 0) {
                TRACCAR_CONFIG.deviceId = devices[0].id;
                console.log('✅ الجهاز:', devices[0].name);
                return devices;
            }
        }
        return [];
    } catch (error) {
        console.error('❌ خطأ:', error);
        return [];
    }
}

async function getDevicePosition() {
    try {
        const response = await fetch(`${TRACCAR_CONFIG.server}/api/positions?deviceId=${TRACCAR_CONFIG.deviceId}`, {credentials: 'include'});
        if (response.ok) {
            const positions = await response.json();
            if (positions.length > 0) {
                updatePosition(positions[0]);
                return positions[0];
            }
        }
    } catch (error) {
        console.error('❌ خطأ:', error);
    }
    return null;
}

function updatePosition(position) {
    currentPosition.lat = position.latitude;
    currentPosition.lon = position.longitude;
    
    document.getElementById('location-info').innerHTML = `
        <p><strong>📍 خط العرض:</strong> ${currentPosition.lat.toFixed(6)}</p>
        <p><strong>📍 خط الطول:</strong> ${currentPosition.lon.toFixed(6)}</p>
        <p><strong>🚗 السرعة:</strong> ${(position.speed * 1.852).toFixed(1)} كم/س</p>
        <p style="color: #4caf50;">✅ متصل بالسوار</p>
    `;
    
    if (userMarker) map.removeLayer(userMarker);
    if (userCircle) map.removeLayer(userCircle);
    
    const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });
    
    userMarker = L.marker([currentPosition.lat, currentPosition.lon], {icon: userIcon}).addTo(map);
    userMarker.bindPopup('<strong>📍 موقع السوار</strong>').openPopup();
    
    if (!isConnected) {
        map.setView([currentPosition.lat, currentPosition.lon], 12);
        isConnected = true;
    }
    
    checkNearbyPlaces();
}

document.getElementById('enable-location').addEventListener('click', async function() {
    this.textContent = "🔄 جاري الاتصال...";
    this.disabled = true;
    
    if (await loginToTraccar()) {
        const devices = await getDevices();
        if (devices.length > 0) {
            await getDevicePosition();
            updateInterval = setInterval(getDevicePosition, TRACCAR_CONFIG.updateInterval);
            this.textContent = "✅ متصل بالسوار";
        }
    }
});

function checkNearbyPlaces() {
    touristPlaces.forEach(place => {
        const distance = calculateDistance(currentPosition.lat, currentPosition.lon, place.lat, place.lon);
        if (distance < notificationDistance && !notifiedPlaces.includes(place.name)) {
            showNotification(place, distance);
            notifiedPlaces.push(place.name);
        }
    });
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function showNotification(place, distance) {
    const notification = document.getElementById('notification');
    notification.innerHTML = `<h3>🎯 ${place.name}</h3><p>على بُعد ${Math.round(distance)} متر!</p>`;
    notification.classList.add('show');
    setTimeout(() => notification.classList.remove('show'), 8000);
}

window.onload = function() {
    initMap();
    console.log('🏰 جاهز!');
};
