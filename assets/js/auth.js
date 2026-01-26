/**
 * VAVEYLA AUTH SYSTEM (LocalStorage Based)
 * Bu dosya giriş, kayıt, çıkış ve yetki kontrollerini yönetir.
 */

// Global giriş durumu (Sayfa yenilendiğinde güncellenir)
window.isLoggedIn = localStorage.getItem('currentUser') ? true : false;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Giriş durumunu kontrol et
    checkLoginStatus();

    // 2. Form Dinleyicilerini Bağla
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            const password = e.target.querySelector('input[type="password"]').value;
            handleLogin(email, password);
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputs = e.target.querySelectorAll('input');
            const name = inputs[0].value;
            const email = inputs[1].value;
            const password = inputs[2].value;
            handleRegister(name, email, password);
        });
    }
});

/** * KAYIT İŞLEMİ 
 */
function handleRegister(name, email, password) {
    // Mevcut kullanıcı listesini al
    const users = JSON.parse(localStorage.getItem('vaveyla_users')) || [];
    
    // E-posta mükerrerlik kontrolü
    if (users.find(u => u.email === email)) {
        howToast("Hata!", "Bu e-posta adresiyle zaten bir hesap var!", "error");
        return;
    }

    // Yeni kullanıcıyı ekle
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password // Demo olduğu için şifrelemiyoruz
    };

    users.push(newUser);
    localStorage.setItem('vaveyla_users', JSON.stringify(users));
    
    showToast("Başarılı!", "Kayıt başarılı! Şimdi giriş yapabilirsin.", "success");
    switchAuth('login'); // Otomatik giriş sekmesine yönlendir
}

/** * GİRİŞ İŞLEMİ 
 */
function handleLogin(email, password) {
    const users = JSON.parse(localStorage.getItem('vaveyla_users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        // Mevcut kullanıcıyı kaydet (şifreyi güvenlik için siliyoruz)
        const sessionUser = { ...user };
        delete sessionUser.password;
        
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        showToast("Başarılı!", `Hoş geldin, ${user.name}!`, "success");
        closeAuthModal();
        
        // Sayfayı yenile ki takvim ve sepet kısıtlamaları kalksın
        location.reload();
    } else {
        showToast("Hata!", "E-posta veya şifre yanlış!, tekrar dene.", "error");
    }
}

function checkAuthAndRun(callback) {
    if (window.isLoggedIn) {
        callback();
    } else {
        showToast("Yetki Gerekli!", "Önce giriş yapmalısın.", "error");
        openAuthModal();
    }
}

/** * DURUM KONTROLÜ (Navbar vb. için)
 */
function checkLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const authBtn = document.getElementById('auth-btn-nav');

    if (currentUser) {
        window.isLoggedIn = true; // Durumu onayla
        if (authBtn) {
            authBtn.innerHTML = `<i class="fa-solid fa-user"></i> ${currentUser.name.split(' ')[0]}`;
            authBtn.onclick = () => { if(confirm("Çıkış yapmak istiyor musun?")) logout(); };
        }
    } else {
        window.isLoggedIn = false; // Durumu sıfırla
        if (authBtn) {
            authBtn.innerHTML = "Giriş Yap";
            authBtn.onclick = openAuthModal;
        }
    }
}

/** * ÇIKIŞ İŞLEMİ 
 */
function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

/** * MODAL VE TAB YÖNETİMİ 
 */
function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'flex';
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) modal.style.display = 'none';
}

function switchAuth(type) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.auth-tab');

    if (type === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

// Modal dışına tıklandığında kapatma
window.onclick = function(event) {
    const modal = document.getElementById('authModal');
    if (event.target == modal) {
        closeAuthModal();
    }
}