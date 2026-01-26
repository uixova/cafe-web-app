document.addEventListener('DOMContentLoaded', () => {
    fetchMenu();
});

async function fetchMenu() {
    try {
        // JSON dosyasını çekiyoruz
        const response = await fetch('assets/data/menu.json');
        if (!response.ok) throw new Error("JSON dosyası yüklenemedi!");
        
        const data = await response.json();
        
        // Konteynerleri seçiyoruz
        const foodGrid = document.getElementById('food-grid');
        const drinkGrid = document.getElementById('drink-grid');

        // Yiyecekleri bas
        renderItems(data.yiyecekler, foodGrid, 'food');
        // İçecekleri bas
        renderItems(data.icecekler, drinkGrid, 'drink');

    } catch (error) {
        console.error("Menü yüklenirken hata oluştu:", error);
    }
}

function renderItems(items, container, category) {
    container.innerHTML = items.map(item => `
        <div class="menu-card" data-category="${category}">
            <div class="card-img">
                <img src="${item.img}" alt="${item.displayName}">
            </div>
            <div class="card-info">
                <h4>${item.displayName}</h4>
                <div class="card-footer">
                    <span class="price">${item.price} TL</span>
                    <button class="add-btn" 
                            data-name="${item.name}" 
                            data-price="${item.price}"
                            onclick="handleMenuClick(this)">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Buton tıklandığında sepet veya modal kontrolü
function handleMenuClick(button) {
    const name = button.getAttribute('data-name');
    const price = parseFloat(button.getAttribute('data-price'));
    const img = button.closest('.menu-card').querySelector('img').src;

    // wok.js'deki özel ürünler listesinde mi?
    if (typeof productData !== "undefined" && productData[name]) {
        openProductModal(name, price, img);
    } else {
        addToCart(name, price, img);
    }
}