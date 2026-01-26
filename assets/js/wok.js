// Özelleştirilebilir ürünlerin veri bankası
const productData = {
    "Pasta": {
        description: "Taze meyveler ve yoğun çikolata ile hazırlanan günlük pasta.",
        variants: [
            { name: "Ahududulu", price: 0 },
            { name: "Çilekli", price: 10 },
            { name: "Muzlu", price: 5 }
        ],
        ingredients: ["Kremşanti", "Çikolata Parçacıkları"],
        extras: [{ name: "Ekstra Sos", price: 15 }, { name: "Antep Fıstığı", price: 20 }]
    },
    "Waffle": {
        description: "Sıcak servis edilen çıtır waffle üzerine bol malzeme.",
        ingredients: ["Çilek", "Muz", "Kivi"],
        extras: [{ name: "Ekstra Çikolata", price: 20 }, { name: "Fındık", price: 10 }]
    },
    "Elmalı Pay": {
        description: "Tarçınlı elma dilimleri ve dondurma eşliğinde.",
        ingredients: ["Tarçın", "Elma Dilimleri"],
        extras: [{ name: "Ekstra Dondurma", price: 30 }]
    }
};

let currentBasePrice = 0;
let currentProductImg = "";

// Modalı açan ana fonksiyon
function openProductModal(name, price, img) {
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('modal-title');
    const modalImg = document.getElementById('modal-img');
    const descEl = document.getElementById('modal-description');
    const currentPriceEl = document.getElementById('current-price');
    const ingContainer = document.getElementById('ingredients-options');
    const extraContainer = document.getElementById('extras-options');

    // Başlangıç değerlerini ata
    title.innerText = name;
    modalImg.src = img;
    currentBasePrice = price;
    currentProductImg = img;
    currentPriceEl.innerText = price;
    
    // İçeriği temizle
    ingContainer.innerHTML = "";
    extraContainer.innerHTML = "";
    const data = productData[name];

    if (data) {
        descEl.innerText = data.description || "";

        // 1. Varyantlar 
        if (data.variants) {
            ingContainer.innerHTML += `<h4>Tür Seçiniz</h4>`;
            data.variants.forEach((v, index) => {
                ingContainer.innerHTML += `
                    <label class="variant-label">
                        <input type="radio" name="variant" class="variant-check" 
                               data-price="${v.price}" value="${v.name}" ${index === 0 ? 'checked' : ''}> 
                        ${v.name} ${v.price > 0 ? '(+' + v.price + '₺)' : ''}
                    </label>
                `;
            });
            ingContainer.innerHTML += `<hr style="margin:15px 0; border:0; border-top:1px solid #333;">`;
        }

        // 2. İçindekiler (Çıkarılabilir)
        if (data.ingredients) {
            ingContainer.innerHTML += `<h4>İçindekiler</h4>`;
            data.ingredients.forEach(ing => {
                ingContainer.innerHTML += `
                    <label><input type="checkbox" class="ing-check" value="${ing}" checked> ${ing}</label>
                `;
            });
        }

        // 3. Ekstralar
        if (data.extras) {
            data.extras.forEach(extra => {
                extraContainer.innerHTML += `
                    <label><input type="checkbox" class="extra-check" data-price="${extra.price}" value="${extra.name}"> ${extra.name} (+${extra.price}₺)</label>
                `;
            });
        }
    }

    // Fiyatı ilk kez hesapla 
    calculateModalPrice();
    modal.style.display = 'block';

    // Değişiklik olduğunda fiyatı güncelle
    modal.onchange = calculateModalPrice;
}

// Fiyatı anlık hesapla
function calculateModalPrice() {
    let extraTotal = 0;
    const selectedVariant = document.querySelector('.variant-check:checked');
    if (selectedVariant) {
        extraTotal += parseFloat(selectedVariant.getAttribute('data-price'));
    }
    document.querySelectorAll('.extra-check:checked').forEach(el => {
        extraTotal += parseFloat(el.getAttribute('data-price'));
    });
    document.getElementById('current-price').innerText = (currentBasePrice + extraTotal);
}

// Modal Kapatma Olayları
document.querySelector('.close-modal').onclick = () => {
    document.getElementById('product-modal').style.display = 'none';
};

// Onay Butonu (Sepete Gönderme)
document.getElementById('confirm-add-btn').onclick = () => {
    const baseName = document.getElementById('modal-title').innerText;
    const selectedVariant = document.querySelector('.variant-check:checked');
    
    // İsimlendirme: Örn "Pasta (Çilekli)"
    const finalName = selectedVariant ? `${baseName} (${selectedVariant.value})` : baseName;
    const finalPrice = parseFloat(document.getElementById('current-price').innerText);
    
    let notes = [];
    document.querySelectorAll('.ing-check:not(:checked)').forEach(el => notes.push(el.value + " olmasın"));
    document.querySelectorAll('.extra-check:checked').forEach(el => notes.push(el.value + " eklendi"));

    if (typeof addToCart === "function") {
        addToCart(finalName, finalPrice, currentProductImg, notes.join(", "));
    }
    
    document.getElementById('product-modal').style.display = 'none';
};