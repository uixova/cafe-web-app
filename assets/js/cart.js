let cart = [];
window.currentTotalPrice = 0; 

document.addEventListener('DOMContentLoaded', () => {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartBtn = document.querySelector('.cart-btn');
    const closeCartBtn = document.getElementById('close-cart');
    const addBtns = document.querySelectorAll('.add-btn');
    const clearCartBtn = document.getElementById('clear-cart');

    // Sepet Açma/Kapatma
    const toggleCart = (show) => {
        cartSidebar.classList.toggle('active', show);
        cartOverlay.classList.toggle('active', show);
    };

    if (cartBtn) cartBtn.addEventListener('click', (e) => { e.preventDefault(); toggleCart(true); });
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCart(false));

    // Sepeti Temizle
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                cart = [];
                updateUI();
            }
        });
    }

    // Menü Kartlarındaki "Ekle" Butonlarını Dinle
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-btn')) {
            const btn = e.target;
            const name = btn.getAttribute('data-name');
            const price = parseFloat(btn.getAttribute('data-price'));
            const img = btn.closest('.menu-card').querySelector('img').src;

            // Eğer Wok.js veya ürün detay sistemi varsa modal aç, yoksa direkt ekle
            if (typeof productData !== "undefined" && productData[name]) {
                openProductModal(name, price, img);
            } else {
                addToCart(name, price, img);
            }
        }
    });
});

// GLOBAL SEPETE EKLEME FONKSİYONU
function addToCart(name, price, img, note = "") {
    const existingItem = cart.find(item => item.name === name && item.note === note);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, img, quantity: 1, note });
    }
    updateUI();
    
    // Görsel geri bildirim için sepeti aç
    document.getElementById('cart-sidebar').classList.add('active');
    document.getElementById('cart-overlay').classList.add('active');
}

// ARAYÜZÜ GÜNCELLE
function updateUI() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalAmount = document.getElementById('cart-total-amount');
    const navCartCount = document.getElementById('cart-count');
    const sideCartCount = document.getElementById('cart-count-side');

    // Toplamı hesapla ve globale yaz
    window.currentTotalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Sepetiniz şu an boş knk.</div>';
    } else {
        cartItemsContainer.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.img}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    ${item.note ? `<small style="color: #888; display: block; margin-bottom: 5px;">${item.note}</small>` : ''}
                    <p>${item.price} ₺</p>
                    <div class="item-controls">
                        <button onclick="changeQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    cartTotalAmount.innerText = window.currentTotalPrice.toLocaleString('tr-TR');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if(navCartCount) navCartCount.innerText = totalItems;
    if(sideCartCount) sideCartCount.innerText = totalItems;
}

window.changeQuantity = (index, delta) => {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) cart.splice(index, 1);
    updateUI();
};

// SİPARİŞ ADIMLARI
function handleOrderStep() {
    // 1. Sepet kontrolü
    if (cart.length === 0) {
        showToast("Başarısız!", "Sepetiniz boş!", "error");
        return;
    }

    // 2. Güncel giriş kontrolü 
    const user = localStorage.getItem('currentUser');
    
    if (user) {
        openOrderModal(); // Giriş varsa özeti aç
    } else {
        showToast("Hata!","Sipariş vermek için önce giriş yapmalısınız!", "error");
        openAuthModal(); // Giriş yoksa modalı aç
    }
}

function openOrderModal() {
    const orderModal = document.getElementById('orderModal');
    const summary = document.getElementById('orderSummary');
    
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');

    // Sipariş listesini oluştur
    const itemsHtml = cart.map(item => `
        <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size:0.9rem;">
            <span>${item.quantity}x ${item.name}</span>
            <span>${(item.price * item.quantity)} ₺</span>
        </div>
    `).join('');

    summary.innerHTML = `
        <div style="border-bottom:1px solid #333; padding-bottom:10px; margin-bottom:15px;">
            ${itemsHtml}
        </div>
        <div style="display:flex; justify-content:space-between; color: var(--primary-color); font-weight:bold; font-size:1.1rem;">
            <span>GENEL TOPLAM:</span>
            <span>${window.currentTotalPrice} ₺</span>
        </div>
        <div style="margin-top:15px; font-size:0.8rem; color:#888;">
            <i class="fa-solid fa-circle-info"></i> Siparişiniz masanıza servis edilecektir.
        </div>
    `;
    
    orderModal.style.display = 'flex';
}

function closeOrderModal() {
    const orderModal = document.getElementById('orderModal');
    if (orderModal) orderModal.style.display = 'none';
}

function confirmOrder() {
    showToast("Başarılı!", "Siparişiniz Vaveyla mutfağına iletildi!", "success");
    closeOrderModal();
    
    // Sepeti sıfırla
    cart = [];
    updateUI();
    
    // Sidebarı kapat
    document.getElementById('cart-sidebar').classList.remove('active');
    document.getElementById('cart-overlay').classList.remove('active');
}