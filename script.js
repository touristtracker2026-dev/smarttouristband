javascript
const touristPlaces = [
    {
        name: "قلعة نزوى",
        lat: 22.9333,
        lon: 57.5333,
        description: "قلعة نزوى من أبرز المعالم التاريخية في سلطنة عمان. بُنيت في القرن السابع عشر في عهد الإمام سلطان بن سيف اليعربي، وتتميز ببرجها الدائري الضخم الذي يبلغ ارتفاعه 34 متراً ويبلغ قطره 43 متراً. استغرق بناء البرج 12 عاماً.",
        image: "https://images.unsplash.com/photo-1612626256634-991e6e977fc1?w=800&q=80"
    },
    {
        name: "جامع السلطان قابوس الأكبر",
        lat: 23.5839,
        lon: 58.3886,
        description: "أحد أجمل المساجد في العالم، يتميز بتصميمه المعماري الفريد والثريا الضخمة التي تزن 8 أطنان والسجادة الفارسية الكبيرة التي تغطي أرضية قاعة الصلاة الرئيسية. يستوعب المسجد أكثر من 20,000 مصلٍ.",
        image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&q=80"
    },
    {
        name: "سوق مطرح",
        lat: 23.6237,
        lon: 58.5648,
        description: "سوق تقليدي يعود تاريخه لمئات السنين، يشتهر بالبخور العماني والحلي الفضية والأقمشة التقليدية والتوابل. يعتبر من أقدم الأسواق في الوطن العربي ويحتفظ بطابعه المعماري الأصيل.",
        image: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80"
    },
    {
        name: "قلعة الجلالي",
        lat: 23.6131,
        lon: 58.5925,
        description: "قلعة تاريخية بُنيت في القرن السادس عشر على يد البرتغاليين لحماية مسقط. تقع على صخرة عالية وتوفر إطلالة خلابة على خليج عمان ومسقط القديمة. تم تحويلها الآن إلى متحف.",
        image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&q=80"
    },
    {
        name: "وادي شاب",
        lat: 22.8383,
        lon: 59.2456,
        description: "واحد من أجمل الوديان في عمان، يتميز بالبرك الزرقاء الصافية والمناظر الطبيعية الخلابة والكهوف المائية. يتطلب الوصول إليه رحلة مشي لمدة 45 دقيقة عبر مسارات جبلية خلابة.",
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
    },
    {
        name: "قلعة بهلا",
        lat: 22.9666,
        lon: 57.3000,
        description: "أحد مواقع التراث العالمي لليونسكو منذ 1987، تعتبر من أقدم وأكبر القلاع في عمان. تتميز بجدرانها الطينية الضخمة التي تمتد لمسافة 12 كيلومتراً وترتفع لـ 15 متراً.",
        image: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80"
    },
    {
        name: "جبل شمس",
        lat: 23.2374,
        lon: 57.2619,
        description: "أعلى قمة جبلية في شبه الجزيرة العربية بارتفاع 3,009 متر. يلقب بـ'سقف عمان' ويوفر مناظر خلابة للأخدود العميق المعروف بـ'الجراند كانيون العماني'. مكان مثالي للتخييم ومشاهدة النجوم.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
    },
    {
        name: "رمال وهيبة",
        lat: 22.3875,
        lon: 58.6603,
        description: "صحراء رملية تمتد على مساحة 12,500 كم² بكثبان ذهبية يصل ارتفاعها إلى 100 متر. موطن للبدو الرحل وتوفر تجربة صحراوية أصيلة مع التخييم وركوب الجمال ومشاهدة غروب الشمس الساحر.",
        image: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80"
    }
];

let map;
let userMarker;
let placeMarkers = [];
let currentPosition = { lat: 0, lon: 0 };
let notificationDistance = 1000;
let notifiedPlaces = [];
let watchId = null;

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

document.getElementById('enable-location').addEventListener('click', function() {
    if ("geolocation" in navigator) {
        this.textContent = "🔄 جاري التفعيل...";
        this.disabled = true;
        
        watchId = navigator.geolocation.watchPosition(
            updateLocation,
            showError,
            { 
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert("⚠️ متصفحك لا يدعم تحديد الموقع");
    }
});

function updateLocation(position) {
    currentPosition.lat = position.coords.latitude;
    currentPosition.lon = position.coords.longitude;
    
    const accuracy = position.coords.accuracy;
    const speed = position.coords.speed;
    
    document.getElementById('location-info').innerHTML = `
        <p><strong>📍 خط العرض:</strong> ${currentPosition.lat.toFixed(5)}</p>
        <p><strong>📍 خط الطول:</strong> ${currentPosition.lon.toFixed(5)}</p>
        <p><strong>🎯 الدقة:</strong> ${Math.round(accuracy)} متر</p>
        ${speed ? `<p><strong>🚗 السرعة:</strong> ${Math.round(speed * 3.6)} كم/س</p>` : ''}
        <p><strong>⏰ آخر تحديث:</strong> ${new Date().toLocaleTimeString('ar-SA')}</p>
    `;
    
    document.getElementById('enable-location').textContent = "✅ التتبع مفعّل";
    
    if (userMarker) {
        map.removeLayer(userMarker);
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
    userMarker.bindPopup("<strong>📍 أنت هنا</strong>").openPopup();
    
    const circle = L.circle([currentPosition.lat, currentPosition.lon], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.1,
        radius: accuracy
    }).addTo(map);
    
    map.setView([currentPosition.lat, currentPosition.lon], 12);
    
    checkNearbyPlaces();
    displayAllPlaces();
}

function showError(error) {
    let message = "";
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = "⚠️ تم رفض الوصول للموقع. يرجى السماح بالوصول من إعدادات المتصفح.";
            break;
        case error.POSITION_UNAVAILABLE:
            message = "⚠️ معلومات الموقع غير متوفرة حالياً.";
            break;
        case error.TIMEOUT:
            message = "⚠️ انتهى وقت طلب تحديد الموقع.";
            break;
        default:
            message = "⚠️ حدث خطأ غير معروف.";
    }
    
    document.getElementById('location-info').innerHTML = `<p>${message}</p>`;
    document.getElementById('enable-location').textContent = "إعادة المحاولة";
    document.getElementById('enable-location').disabled = false;
}

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
        nearbyList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">لا توجد مواقع قريبة منك حالياً (ضمن 10 كم)</p>';
    }
}

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
                📍 ${distanceText} ${isNearby ? '- قريب جداً!' : ''}
            </span>
        </div>
    `;
    
    return card;
}

function showNotification(place, distance) {
    const notification = document.getElementById('notification');
    const distanceText = Math.round(distance);
    
    notification.innerHTML = `
        <h3>🎯 ${place.name}</h3>
        <p>أنت على بُعد ${distanceText} متر فقط من هذا الموقع الرائع!</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">${place.description.substring(0, 100)}...</p>
    `;
    
    notification.classList.add('show');
    
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 8000);
}

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
        distanceInfo = `<p><strong>📏 المسافة من موقعك:</strong> ${distanceText}</p>`;
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

function openInMaps(lat, lon) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
}

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

document.querySelector('.close').onclick = function() {
    document.getElementById('place-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('place-modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

window.onload = function() {
    initMap();
    displayAllPlaces();
    
    console.log('🏰 المرشد السياحي الذكي - جاهز!');
    console.log('📍 المواقع المتوفرة:', touristPlaces.length);
}
