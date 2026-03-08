javascript
// ⚙️ إعدادات Traccar - معلوماتك الخاصة
const TRACCAR_CONFIG = {
    server: 'https://demo.traccar.org',
    email: 'tourist.tracker2026@gmail.com',
    password: 'tourist12345',
    deviceId: null,
    updateInterval: 10000  // التحديث كل 10 ثواني
};

// 📍 المواقع السياحية في عمان
const touristPlaces = [
    {
        name: "قلعة نزوى",
        lat: 22.9333,
        lon: 57.5333,
        description: "قلعة نزوى من أبرز المعالم التاريخية في سلطنة عمان. بُنيت في القرن السابع عشر في عهد الإمام سلطان بن سيف اليعربي، وتتميز ببرجها الدائري الضخم.",
        image: "https://images.unsplash.com/photo-1612626256634-991e6e977fc1?w=800&q=80"
    },
    {
        name: "جامع السلطان قابوس الأكبر",
        lat: 23.5839,
        lon: 58.3886,
        description: "أحد أجمل المساجد في العالم، يتميز بتصميمه المعماري الفريد والثريا الضخمة التي تزن 8 أطنان والسجادة الفارسية الكبيرة.",
        image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80"
    },
    {
        name: "سوق مطرح",
        lat: 23.6237,
        lon: 58.5648,
        description: "سوق تقليدي يعود تاريخه لمئات السنين، يشتهر بالبخور العماني والحلي الفضية والأقمشة التقليدية والتوابل.",
        image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80"
    },
    {
        name: "قلعة الجلالي",
        lat: 23.6131,
        lon: 58.5925,
        description: "قلعة تاريخية بُنيت في القرن السادس عشر على يد البرتغاليين لحماية مسقط. تقع على صخرة عالية وتوفر إطلالة خلابة.",
        image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&q=80"
    },
    {
        name: "وادي شاب",
        lat: 22.8383,
        lon: 59.2456,
        description: "واحد من أجمل الوديان في عمان، يتميز بالبرك الزرقاء الصافية والمناظر الطبيعية الخلابة والكهوف المائية.",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
    },
    {
        name: "قلعة بهلا",
        lat: 22.9666,
        lon: 57.3000,
        description: "أحد مواقع التراث العالمي لليونسكو، تعتبر من أقدم وأكبر القلاع في عمان. تتميز بجدرانها الطينية الضخمة.",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80"
    },
    {
        name: "جبل شمس",
        lat: 23.2374,
        lon: 57.2619,
        description: "أعلى قمة جبلية في شبه الجزيرة العربية بارتفاع 3,009 متر. يلقب بـ'سقف عمان' ويوفر مناظر خلابة.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
    },
    {
        name: "رمال وهيبة",
        lat: 22.3875,
        lon: 58.6603,
        description: "صحراء رملية تمتد على مساحة 12,500 كم² بكثبان ذهبية يصل ارتفاعها إلى 100 متر. موطن للبدو الرحل.",
        image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80"
    }
];

// 🗺️ متغيرات عامة
let map;
let userMarker;
let userCircle;
let placeMarkers = [];
let currentPosition = { lat: 0, lon: 0 };
let notificationDistance = 1000;
let notifiedPlaces = [];
let updateInterval = null;
let isConnected = false;

// 🚀 تهيئة الخريطة
function initMap() {
    map = L.map('map').setView([23.5859, 58.4059], 7);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    touristPlaces.forEach(place => {
        const marker = L.marker([place.lat, place.lon]).addTo(map);
        marker.bindPopup(`
            <div style="text-align: center; max-width: 200px;">
                <h3 style="color: #667eea; margin-bottom: 10px;">${place.name}</h3>
                <p style="margin-bottom: 10px;">${place.description.substring(0, 80)}...</p>
                <button onclick="showPlaceDetails('${place.name}')" style="background: #667eea; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;">المزيد</button>
            </div>
        `);
        placeMarkers.push(marker);
    });
}

// 🔐 تسجيل الدخول إلى Traccar
async function loginToTraccar() {
    try {
        console.log('🔄 جاري تسجيل الدخول إلى Traccar...');
        
        const response = await fetch(`${TRACCAR_CONFIG.server}/api/session`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `email=${encodeURIComponent(TRACCAR_CONFIG.email)}&password=${encodeURIComponent(TRACCAR_CONFIG.password)}`,
            credentials: 'include'
        });

        if (response.ok) {
            const userData = await response.json();
            console.log('✅ تم تسجيل الدخول بنجاح:', userData.name);
            return true;
        } else {
            const errorText = await response.text();
            console.error('❌ فشل تسجيل الدخول:', response.status, errorText);
            showError(`فشل تسجيل الدخول (${response.status}). تحقق من البريد وكلمة المرور.`);
            return false;
        }
    } catch (error) {
        console.error('❌ خطأ في الاتصال بـ Traccar:', error);
        showError('خطأ في الاتصال بخادم Traccar. تحقق من الإنترنت.');
        return false;
    }
}

// 📱 جلب معلومات الأجهزة
async function getDevices() {
    try {
        console.log('🔄 جاري جلب الأجهزة...');
        
        const response = await fetch(`${TRACCAR_CONFIG.server}/api/devices`, {
            credentials: 'include'
        });

        if (response.ok) {
            const devices = await response.json();
            console.log('📱 الأجهزة المتاحة:', devices.length);
            
            if (devices.length > 0) {
                TRACCAR_CONFIG.deviceId = devices[0].id;
                console.log('✅ تم اختيار الجهاز:', devices[0].name, 'ID:', devices[0].id);
                return devices;
            } else {
                showError('❌ لا توجد أجهزة مسجلة. يرجى إضافة جهاز في Traccar أولاً.');
                return [];
            }
        } else {
            console.error('❌ فشل جلب الأجهزة:', response.status);
            showError('فشل جلب الأجهزة من Traccar');
            return [];
        }
    } catch (error) {
        console.error('❌ خطأ في جلب الأجهزة:', error);
        showError('خطأ في جلب الأجهزة');
        return [];
    }
}

// 📍 جلب موقع الجهاز من Traccar
async function getDevicePosition() {
    if (!TRACCAR_CONFIG.deviceId) {
        console.error('❌ لا يوجد Device ID');
        return null;
    }
    
    try {
        const response = await fetch(`${TRACCAR_CONFIG.server}/api/positions?deviceId=${TRACCAR_CONFIG.deviceId}`, {
            credentials: 'include'
        });

        if (response.ok) {
            const positions = await response.json();
            if (positions.length > 0) {
                const position = positions[0];
                console.log('📍 تم جلب الموقع:', position.latitude, position.longitude);
                updatePosition(position);
                return position;
            } else {
                console.warn('⚠️ لا توجد مواقع متاحة للجهاز');
                showError('لا توجد بيانات موقع من السوار. تأكد من تشغيل السوار وإرسال البيانات.');
            }
        } else {
            console.error('❌ فشل جلب الموقع:', response.status);
        }
    } catch (error) {
        console.error('❌ خطأ في جلب الموقع:', error);
    }
    return null;
}

// 🔄 تحديث الموقع على الخريطة
function updatePosition(position) {
    currentPosition.lat = position.latitude;
    currentPosition.lon = position.longitude;
    
    const speed = position.speed || 0;
    const course = position.course || 0;
    const altitude = position.altitude || 0;
    const lastUpdate = new Date(position.fixTime);
    const now = new Date();
    const timeDiff = Math.floor((now - lastUpdate) / 1000);
    
    let timeAgo = '';
    if (timeDiff < 60) {
        timeAgo = 'الآن';
    } else if (timeDiff < 3600) {
        timeAgo = `قبل ${Math.floor(timeDiff / 60)} دقيقة`;
    } else {
        timeAgo = `قبل ${Math.floor(timeDiff / 3600)} ساعة`;
    }
    
    document.getElementById('location-info').innerHTML = `
        <p><strong>📍 خط العرض:</strong> ${currentPosition.lat.toFixed(6)}</p>
        <p><strong>📍 خط الطول:</strong> ${currentPosition.lon.toFixed(6)}</p>
        <p><strong>🚗 السرعة:</strong> ${(speed * 1.852).toFixed(1)} كم/س</p>
        <p><strong>🧭 الاتجاه:</strong> ${Math.round(course)}°</p>
        <p><strong>⛰️ الارتفاع:</strong> ${Math.round(altitude)} متر</p>
        <p><strong>⏰ آخر تحديث:</strong> ${timeAgo}</p>
        <p style="color: #4caf50; font-weight: bold;">✅ متصل بالسوار</p>
    `;
    
    if (userMarker) {
        map.removeLayer(userMarker);
    }
    if (userCircle) {
        map.removeLayer(userCircle);
    }
    
    const userIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    
    userMarker = L.marker([currentPosition.lat, currentPosition.lon], {icon: userIcon}).addTo(map);
    userMarker.bindPopup(`
        <div style="text-align: center;">
            <strong>📍 موقع السوار</strong><br>
            السرعة: ${(speed * 1.852).toFixed(1)} كم/س<br>
            ${timeAgo}
        </div>
    `).openPopup();
    
    userCircle = L.circle([currentPosition.lat, currentPosition.lon], {
        color: '#f44336',
        fillColor: '#f44336',
        fillOpacity: 0.1,
        radius: 500
    }).addTo(map);
    
    if (!isConnected) {
        map.setView([currentPosition.lat, currentPosition.lon], 12);
        isConnected = true;
    }
    
    checkNearbyPlaces();
    displayAllPlaces();
}

// 🎯 بدء التتبع
document.getElementById('enable-location').addEventListener('click', async function() {
    this.textContent = "🔄 جاري الاتصال بـ Traccar...";
    this.disabled = true;
    
    const loggedIn = await loginToTraccar();
    if (!loggedIn) {
        this.textContent = "❌ فشل الاتصال - أعد المحاولة";
        this.disabled = false;
        return;
    }
    
    const devices = await getDevices();
    if (devices.length === 0) {
        this.textContent = "❌ لا توجد أجهزة - أعد المحاولة";
        this.disabled = false;
        return;
    }
    
    await getDevicePosition();
    
    updateInterval = setInterval(getDevicePosition, TRACCAR_CONFIG.updateInterval);
    
    this.textContent = "✅ متصل بالسوار";
    
    showNotificationMessage("🎉 تم الاتصال بالسوار بنجاح! يتم تحديث الموقع كل 10 ثواني.", "success");
});

// 🔔 عرض رسالة إشعار
function showNotificationMessage(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.innerHTML = `<p>${message}</p>`;
    notification.style.background = type === 'success' 
        ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
        : type === 'error'
        ? 'linear-gradient(135deg, #f44336 0%, #e53935 100%)'
        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// ❌ عرض خطأ
function showError(message) {
    document.getElementById('location-info').innerHTML = `
        <p style="color: #f44336; padding: 1rem;">⚠️ ${message}</p>
    `;
    showNotificationMessage(message, 'error');
}

// 🎯 حساب المسافة
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    
    return R * c;
}

// 🔍 التحقق من الأماكن القريبة
function checkNearbyPlaces() {
    const nearbyList = document.getElementById('places-list');
    nearbyList.innerHTML = '';
    
    let foundNearby = false;
    const sortedPlaces = [];
    
    touristPlaces.forEach(place => {
        const distance = calculateDistance(
            currentPosition.lat,
            currentPosition.lon,
            place.lat,
            place.lon
        );
        
        sortedPlaces.push({ place, distance });
    });
    
    sortedPlaces.sort((a, b) => a.distance - b.distance);
    
    sortedPlaces.forEach(({ place, distance }) => {
        if (distance < 10000) {
            foundNearby = true;
            const card = createPlaceCard(place, distance);
            nearbyList.appendChild(card);
            
            if (distance < notificationDistance && !notifiedPlaces.includes(place.name)) {
                showNotification(place, distance);
                notifiedPlaces.push(place.name);
            }
        }
    });
    
    if (!foundNearby) {
        nearbyList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">لا توجد مواقع قريبة حالياً (ضمن 10 كم)</p>';
    }
}

// 🎴 إنشاء بطاقة موقع
function createPlaceCard(place, distance) {
    const card = document.createElement('div');
    card.className = 'place-card';
    card.onclick = () => showPlaceDetails(place.name);
    
    const distanceText = distance < 1000 
        ? `${Math.round(distance)} متر`
        : `${(distance/1000).toFixed(1)} كم`;
    
    const isNearby = distance < notificationDistance;
    
    card.innerHTML = `
        <img src="${place.image}" alt="${place.name}" loading="lazy">
        <div class="place-card-content">
            <h3>${place.name}</h3>
            <p>${place.description.substring(0, 120)}...</p>
            <span class="place-distance ${isNearby ? 'nearby' : ''}">
                📍 ${distanceText} ${isNearby ? '🔥 قريب جداً!' : ''}
            </span>
        </div>
    `;
    
    return card;
}

// 🔔 عرض إشعار موقع قريب
function showNotification(place, distance) {
    const notification = document.getElementById('notification');
    const distanceText = Math.round(distance);
    
    notification.innerHTML = `
        <h3>🎯 ${place.name}</h3>
        <p><strong>السوار على بُعد ${distanceText} متر فقط!</strong></p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">${place.description.substring(0, 120)}...</p>
    `;
    
    notification.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 10000);
}

// 📖 عرض تفاصيل الموقع
function showPlaceDetails(placeName) {
    const place = touristPlaces.find(p => p.name === placeName);
    const modal = document.getElementById('place-modal');
    const modalBody = document.getElementById('modal-body');
    
    let distanceInfo = '';
    if (currentPosition.lat !== 0) {
        const distance = calculateDistance(
            currentPosition.lat,
            currentPosition.lon,
            place.lat,
            place.lon
        );
        const distanceText = distance < 1000 
            ? `${Math.round(distance)} متر`
            : `${(distance/1000).toFixed(1)} كم`;
        distanceInfo = `<p><strong>📏 المسافة من السوار:</strong> ${distanceText}</p>`;
    }
    
    modalBody.innerHTML = `
        <h2>${place.name}</h2>
        <img src="${place.image}" alt="${place.name}" loading="lazy">
        <p>${place.description}</p>
        ${distanceInfo}
        <p><strong>📍 الإحداثيات:</strong> ${place.lat.toFixed(4)}, ${place.lon.toFixed(4)}</p>
        <button class="btn" onclick="openInMaps(${place.lat}, ${place.lon})">
            🗺️ فتح في خرائط Google
        </button>
    `;
    
    modal.style.display = 'block';
}

// 🗺️ فتح في Google Maps
function openInMaps(lat, lon) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
}

// 📋 عرض جميع المواقع
function displayAllPlaces() {
    const grid = document.getElementById('all-places-grid');
    grid.innerHTML = '';
    
    const placesWithDistance = touristPlaces.map(place => {
        let distance = null;
        if (currentPosition.lat !== 0) {
            distance = calculateDistance(
                currentPosition.lat,
                currentPosition.lon,
                place.lat,
                place.lon
            );
        }
        return { place, distance };
    });
    
    if (currentPosition.lat !== 0) {
        placesWithDistance.sort((a, b) => (a.distance || 999999) - (b.distance || 999999));
    }
    
    placesWithDistance.forEach(({ place, distance }) => {
        const card = createPlaceCard(place, distance || 999999);
        grid.appendChild(card);
    });
}

// ❌ إغلاق Modal
document.querySelector('.close').onclick = function() {
    document.getElementById('place-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('place-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// 🚀 تهيئة عند تحميل الصفحة
window.onload = function() {
    initMap();
    displayAllPlaces();
    
    console.log('🏰 المرشد السياحي الذكي - جاهز!');
    console.log('📍 المواقع المتوفرة:', touristPlaces.length);
    console.log('🔗 خادم Traccar:', TRACCAR_CONFIG.server);
    console.log('📧 البريد:', TRACCAR_CONFIG.email);
}

// 🧹 تنظيف عند إغلاق الصفحة
window.onbeforeunload = function() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
}
