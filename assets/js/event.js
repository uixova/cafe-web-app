let eventData = {}; // JSON'dan gelecek veri
let currentDate = new Date();

document.addEventListener('DOMContentLoaded', () => {
    fetchEvents();
});

async function fetchEvents() {
    try {
        const response = await fetch('assets/data/event.json');
        eventData = await response.json();
        initCalendar();
    } catch (error) {
        console.error("Etkinlikler yüklenemedi:", error);
        initCalendar(); // Veri gelmese de takvimi çiz
    }
}

function initCalendar() {
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');

    renderCalendar();

    prevBtn.onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    };

    nextBtn.onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    };
}

function renderCalendar() {
    const monthDisplay = document.getElementById('monthDisplay');
    const calendarDays = document.getElementById('calendarDays');

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-11 arası döner

    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    monthDisplay.innerText = `${monthNames[month]} ${year}`;

    calendarDays.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    // Boş kutucuklar
    for (let i = 0; i < firstDay; i++) {
        calendarDays.innerHTML += `<div class="day empty"></div>`;
    }

    for (let day = 1; day <= lastDate; day++) {
        // HATA DÜZELTME: Ay değerine +1 ekleyerek JSON formatına (09, 10 vb.) eşitliyoruz
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const hasEvent = eventData[dateKey] ? 'event-day' : '';
        const isToday = (day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) ? 'active' : '';

        const dayDiv = document.createElement('div');
        dayDiv.className = `day ${hasEvent} ${isToday}`;
        dayDiv.style.position = 'relative';
        dayDiv.innerText = day;

        dayDiv.onclick = () => {
            document.querySelectorAll('.day').forEach(d => d.classList.remove('active'));
            dayDiv.classList.add('active');
            updateEventDetails(dateKey); // dateKey artık JSON ile %100 uyumlu
        };

        calendarDays.appendChild(dayDiv);
    }
}

function updateEventDetails(dateKey) {
    const eventContainer = document.querySelector('.event-details');
    const events = eventData[dateKey];

    if (!events || events.length === 0) {
        eventContainer.innerHTML = `
            <div class="event-card" style="border-left: 4px solid #444; opacity: 0.6;">
                <p>Bu tarihte (${dateKey}) bir etkinlik bulunmuyor.</p>
            </div>`;
        return;
    }

    eventContainer.innerHTML = events.map((ev, index) => `
        <div class="event-card ${index > 0 ? 'secondary' : ''}">
            <span class="event-time">${ev.time}</span>
            <h4>${ev.title}</h4>
            <p>${ev.desc}</p>
            <div class="event-footer">
                <span class="event-location">
                    <i class="fa-solid fa-location-dot"></i> ${ev.location}
                </span>
                <button class="join-btn" onclick="const user = localStorage.getItem('currentUser'); 
                    if(user){ 
                    showToast('Kayıt Başarılı!', '${ev.title} için kaydınız alındı!', 'success'); 
                    } else { 
                    showToast('Giriş Gerekli!', 'Etkinliğe kayıt olmak için önce giriş yapmalısın.', 'error'); 
                    openAuthModal(); 
                    }">Kayıt Ol</button>
            </div>
        </div>
    `).join('');
}