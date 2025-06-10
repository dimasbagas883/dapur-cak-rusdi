// =================================================================
// KODE LENGKAP DAN FINAL UNTUK app.js (TERMASUK PEMBAYARAN DUMMY)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- BAGIAN 1: DEKLARASI SEMUA ELEMEN ---
    const menuContainer = document.getElementById('menu-container');
    const cartCount = document.getElementById('cart-count');
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.getElementById('cart-modal');
    const closeButton = document.querySelector('.close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const checkoutForm = document.getElementById('checkout-form');
    const orderStatus = document.getElementById('order-status');

    // Elemen untuk form dinamis (alamat/meja)
    const orderTypeRadios = document.querySelectorAll('input[name="order-type"]');
    const addressInputGroup = document.getElementById('address-input-group');
    const tableInputGroup = document.getElementById('table-input-group');
    const customerAddressInput = document.getElementById('customer-address');
    const tableNumberInput = document.getElementById('table-number');

    // Elemen untuk modal pembayaran dummy
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentButton = document.querySelector('.close-payment-button');
    const summaryName = document.getElementById('summary-name');
    const summaryTotal = document.getElementById('summary-total');
    const paymentLoader = document.getElementById('payment-loader');
    const paymentButtons = document.querySelectorAll('.payment-btn');
    const heroButton = document.getElementById('hero-cta-button');
    // ... (setelah const heroButton = ...)


    // Variabel untuk menyimpan data sementara
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let pendingOrderData = null;

    // --- BAGIAN 2: KUMPULAN FUNGSI ---

    // GANTI FUNGSI fetchMenu() LAMA ANDA DENGAN VERSI BARU INI

async function fetchMenu() {
    try {
        const response = await fetch('/api/menu');
        const menuItems = await response.json();
        
        const groupedMenu = menuItems.reduce((acc, item) => {
            const category = item.category || 'Lainnya';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {});

        menuContainer.innerHTML = '';

        for (const category in groupedMenu) {
            const categoryTitle = document.createElement('h2');
            categoryTitle.className = 'category-title';
            categoryTitle.textContent = category;
            menuContainer.appendChild(categoryTitle);

            const categoryGrid = document.createElement('div');
            categoryGrid.className = 'menu-grid-container';
            
            groupedMenu[category].forEach(item => {
                const menuItemDiv = document.createElement('div');
                // PENTING: Hapus kelas 'show' dari sini jika ada, biarkan CSS yang mengontrol
                menuItemDiv.className = 'menu-item'; 
                menuItemDiv.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="menu-item-content">
                        <h3>${item.name}</h3>
                        <p>Rp ${item.price.toLocaleString('id-ID')}</p>
                        <button data-id="${item.id}" data-name="${item.name}" data-price="${item.price}"><i class="bi bi-cart-plus-fill"></i> Tambah ke Keranjang</button>
                    </div>
                `;
                categoryGrid.appendChild(menuItemDiv);
            });

            menuContainer.appendChild(categoryGrid);
        }

        // ▼▼▼ KODE OBSERVER SEKARANG DILETAKKAN DI SINI ▼▼▼
        // Ini memastikan kita baru mengamati setelah semua elemen .menu-item dibuat
        const allMenuItems = document.querySelectorAll('.menu-item');
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        allMenuItems.forEach(item => {
            observer.observe(item);
        });

    } catch (error) {
        console.error('Gagal mengambil menu:', error);
        menuContainer.innerHTML = '<p>Gagal memuat menu. Coba lagi nanti.</p>';
    }
}

    function addToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) existingItem.quantity++;
        else cart.push({ id, name, price, quantity: 1 });
        updateCart();
    }

    function updateCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartItemsContainer.innerHTML = '';
        let total = 0;
        cart.forEach(item => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            cartItemDiv.innerHTML = `<span>${item.name} (x${item.quantity})</span><span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>`;
            cartItemsContainer.appendChild(cartItemDiv);
            total += item.price * item.quantity;
        });
        cartTotalSpan.textContent = total.toLocaleString('id-ID');
    }

    // Fungsi ini HANYA untuk membuka modal pembayaran
    function submitOrder(event) {
        event.preventDefault();
        const customerName = document.getElementById('customer-name').value;
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderType = document.querySelector('input[name="order-type"]:checked').value;
        const locationInfo = orderType === 'online' ? customerAddressInput.value : tableNumberInput.value;
        if (cart.length === 0) {
            alert('Keranjang Anda kosong!');
            return;
        }
        pendingOrderData = {
            customerName, items: cart, total, orderType, locationInfo, paymentStatus: 'paid'
        };
        summaryName.textContent = customerName;
        summaryTotal.textContent = `Rp ${total.toLocaleString('id-ID')}`;
        cartModal.style.display = 'none';
        paymentModal.style.display = 'block';
    }

    // GANTI FUNGSI LAMA DENGAN INI
async function finalizeOrder(orderData) {
    try {
        const response = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message);

        // --- PERUBAHAN DI SINI ---
        // Alih-alih alert, tampilkan pesan sukses di dalam modal pembayaran
        paymentLoader.style.display = 'none'; // Sembunyikan loading spinner

        const paymentContent = paymentModal.querySelector('.modal-content');
// PASTIKAN MENGGUNAKAN BACKTICK ( ` ), BUKAN KUTIP BIASA ( ' )
paymentContent.innerHTML = `
    <h2 style="color: var(--success-color);">Pesanan Berhasil!</h2>
    <p>Terima kasih, ${orderData.customerName}. Pesanan Anda sedang kami proses.</p>
    <p><strong>ID Pesanan Anda:</strong> ${result.orderId}</p>
    <a href="/lacak?orderId=${result.orderId}" class="admin-login-button" style="margin-top: 1rem;">
        <i class="bi bi-geo-alt-fill"></i> Lacak Pesanan Saya
    </a>
    <p style="margin-top: 1rem; cursor: pointer; font-size: 0.9rem;" onclick="location.reload()">Buat Pesanan Baru</p>
`;
// --- BATAS PERUBAHAN ---

        cart = [];
        updateCart();
        checkoutForm.reset();

    } catch (error) {
        alert(`Error: ${error.message}`);
        paymentLoader.style.display = 'none';
    }
}

    // --- BAGIAN 3: KUMPULAN EVENT LISTENER ---
    
    menuContainer.addEventListener('click', (event) => {
        if (event.target.tagName === 'BUTTON' && event.target.closest('.menu-item')) {
            addToCart(parseInt(event.target.dataset.id), event.target.dataset.name, parseInt(event.target.dataset.price));
        }
    });

    cartIcon.addEventListener('click', () => {
        updateCart();
        cartModal.style.display = 'block';
        orderStatus.textContent = '';
    });

    closeButton.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === cartModal || event.target === paymentModal) {
            cartModal.style.display = 'none';
            paymentModal.style.display = 'none';
        }
    });

    checkoutForm.addEventListener('submit', submitOrder);
// ... setelah checkoutForm.addEventListener ...

// Event listener untuk tombol di Hero Section
if (heroButton) {
    heroButton.addEventListener('click', (event) => {
        event.preventDefault(); // Mencegah link anchor melompat secara instan

        // Cari elemen menu dan scroll ke sana dengan halus
        document.getElementById('menu-container').scrollIntoView({
            behavior: 'smooth'
        });
    });
}
    orderTypeRadios.forEach(radio => {
        radio.addEventListener('change', (event) => {
            if (event.target.value === 'onlinef') {
                addressInputGroup.style.display = 'block';
                tableInputGroup.style.display = 'none';
                customerAddressInput.required = true;
                tableNumberInput.required = false;
            } else {
                addressInputGroup.style.display = 'none';
                tableInputGroup.style.display = 'block';
                customerAddressInput.required = false;
                tableNumberInput.required = true;
            }
        });
    });

    paymentButtons.forEach(button => {
        button.addEventListener('click', () => {
            paymentLoader.style.display = 'block';
            setTimeout(() => {
                finalizeOrder(pendingOrderData);
            }, 2500);
        });
    });

    closePaymentButton.addEventListener('click', () => {
        paymentModal.style.display = 'none';
        paymentLoader.style.display = 'none';
    });


    // --- BAGIAN 4: INISIALISASI AWAL ---
    fetchMenu();
    updateCart();
});