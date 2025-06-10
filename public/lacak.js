// KODE BARU UNTUK lacak.js
document.addEventListener('DOMContentLoaded', () => {
    const trackingForm = document.getElementById('tracking-form');
    const orderIdInput = document.getElementById('order-id-input');
    const resultContainer = document.getElementById('result-container');

    // Fungsi utama untuk melacak pesanan
    async function trackOrder(orderId) {
        if (!orderId) return;

        resultContainer.style.display = 'block';
        resultContainer.innerHTML = '<p>Mencari pesanan...</p>';

        try {
            const response = await fetch(`/api/orders/${orderId}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            const orderDate = new Date(data.createdAt).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });
    resultContainer.innerHTML = `
        <h3>Detail Pesanan: ${data.orderId}</h3>
        <p><strong>Nama Pelanggan:</strong> ${data.customerName}</p>
        <p><strong>Tanggal Pesan:</strong> <span class="math-inline">${orderDate}</span></p>
        <hr>
        <p><strong>Status Pesanan:</strong> <span class="status-badge status-${data.status.toLowerCase().replace(/ /g, '-')}">${data.status}</span></p>
    `;
} catch (error) {
    resultContainer.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
}
}

    // Event listener untuk form manual
    trackingForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const orderId = orderIdInput.value.trim();
        trackOrder(orderId);
    });

    // --- BAGIAN BARU: Otomatis lacak jika ada ID di URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = urlParams.get('orderId');

    if (orderIdFromUrl) {
        orderIdInput.value = orderIdFromUrl; // Isi otomatis form
        trackOrder(orderIdFromUrl); // Langsung lacak
    }
});