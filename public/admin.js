// =================================================================
// KODE LENGKAP DAN FINAL UNTUK admin.js (TERMASUK UPDATE STATUS)
// =================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- DEKLARASI ELEMEN ---
    const form = document.getElementById('menu-form');
    const menuIdInput = document.getElementById('menu-id');
    const menuNameInput = document.getElementById('menu-name');
    const menuPriceInput = document.getElementById('menu-price');
    const menuImageInput = document.getElementById('menu-image');
    const menuCategoryInput = document.getElementById('menu-category');
    const tableBody = document.getElementById('menu-table-body');
    const orderTableBody = document.getElementById('order-table-body');
    const submitButton = form.querySelector('button');

    const API_URL_MENU = '/api/menu';
    const API_URL_ORDERS = '/api/orders';

    // --- FUNGSI UNTUK KELOLA MENU ---

    async function fetchAndDisplayMenu() {
        try {
            const response = await fetch(API_URL_MENU);
            const menuItems = await response.json();
            tableBody.innerHTML = '';
            menuItems.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.name}</td>
                        <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                        <td>${item.category}</td>
                        <td class="actions">
                            <button onclick="handleEdit(${item.id})"><i class="bi bi-pencil-square"></i> Edit</button>
                            <button onclick="handleDelete(${item.id})"><i class="bi bi-trash-fill"></i> Hapus</button>
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        } catch (error) {
            console.error('Gagal memuat menu:', error);
        }
    }

    // --- FUNGSI UNTUK KELOLA PESANAN (VERSI TERBARU) ---

    async function fetchAndDisplayOrders() {
        try {
            const response = await fetch(API_URL_ORDERS);
            const orders = await response.json();
            orderTableBody.innerHTML = '';
            orders.forEach(order => {
                const itemsDetails = order.items.map(item => `<li>${item.name} (x${item.quantity})</li>`).join('');
                const orderDate = new Date(order.createdAt).toLocaleString('id-ID', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                let locationDisplay = '';
                if (order.orderType === 'online') {
                    locationDisplay = `<strong>Alamat:</strong><br>${order.locationInfo.replace(/\n/g, '<br>')}`;
                } else if (order.orderType === 'dine-in') {
                    locationDisplay = `<strong>No. Meja:</strong> ${order.locationInfo}`;
                } else {
                    locationDisplay = order.locationInfo || 'N/A';
                }
                const paymentStatusClass = order.paymentStatus === 'paid' ? 'status-paid' : 'status-pending';
                const paymentStatusText = order.paymentStatus === 'paid' ? 'Lunas' : 'Tertunda';

                // Membuat dropdown untuk status pesanan
                const statusOptions = ['Baru', 'Sedang Diproses', 'Selesai', 'Dibatalkan'];
                const statusDropdown = `
                    <select class="status-dropdown" data-order-id="${order.orderId}">
                        ${statusOptions.map(status => `
                            <option value="${status}" ${order.status === status ? 'selected' : ''}>
                                ${status}
                            </option>
                        `).join('')}
                    </select>
                `;

                const row = `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>${order.customerName}</td>
                        <td><ul>${itemsDetails}</ul></td>
                        <td>Rp ${order.total.toLocaleString('id-ID')}</td>
                        <td>${locationDisplay}</td>
                        <td><span class="status-badge ${paymentStatusClass}">${paymentStatusText}</span></td>
                        <td>${statusDropdown}</td>
                        <td>${orderDate}</td>
                    </tr>
                `;
                orderTableBody.innerHTML += row;
            });
        } catch (error) {
            console.error('Gagal memuat pesanan:', error);
        }
    }


    // --- KUMPULAN EVENT LISTENER ---

    // Event listener untuk form tambah/edit menu
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const id = menuIdInput.value;
        const menuItemData = { name: menuNameInput.value, price: menuPriceInput.value, image: menuImageInput.value, category: menuCategoryInput.value };
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL_MENU}/${id}` : API_URL_MENU;
        try {
            const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(menuItemData) });
            if (!response.ok) throw new Error('Gagal menyimpan data');
            form.reset();
            menuIdInput.value = '';
            submitButton.innerHTML = '<i class="bi bi-plus-circle-fill"></i> Tambah Menu';
            await fetchAndDisplayMenu();
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Event listener untuk semua dropdown status di tabel pesanan (EVENT DELEGATION)
    orderTableBody.addEventListener('change', async (event) => {
        if (event.target.classList.contains('status-dropdown')) {
            const orderId = event.target.dataset.orderId;
            const newStatus = event.target.value;
            try {
                const response = await fetch(`/api/orders/${orderId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                if (!response.ok) throw new Error('Gagal update status');
                event.target.style.border = '2px solid var(--success-color)';
                setTimeout(() => { event.target.style.border = ''; }, 1500);
            } catch (error) {
                console.error('Error updating status:', error);
                alert('Gagal mengubah status pesanan.');
            }
        }
    });


    // --- FUNGSI BANTUAN YANG DIPANGGIL DARI ONCLICK ---

    window.handleEdit = async (id) => {
        try {
            const response = await fetch(`/api/menu`);
            const menuItems = await response.json();
            const itemToEdit = menuItems.find(item => item.id === id);
            if (itemToEdit) {
                menuIdInput.value = itemToEdit.id;
                menuNameInput.value = itemToEdit.name;
                menuPriceInput.value = itemToEdit.price;
                menuImageInput.value = itemToEdit.image;
                menuCategoryInput.value = itemToEdit.category;
                submitButton.innerHTML = '<i class="bi bi-check-circle-fill"></i> Update Menu';
                window.scrollTo(0, 0);
            }
        } catch (error) {
            console.error('Gagal mengambil data untuk diedit:', error);
        }
    };

    window.handleDelete = async (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
            try {
                const response = await fetch(`${API_URL_MENU}/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Gagal menghapus menu');
                await fetchAndDisplayMenu();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    // --- INISIALISASI AWAL ---
    fetchAndDisplayMenu();
    fetchAndDisplayOrders();
});