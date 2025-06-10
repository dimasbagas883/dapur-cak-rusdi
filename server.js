// =================================================================
// KODE SERVER.JS VERSI FINAL - SUDAH TERMASUK SEMUA PERBAIKAN
// =================================================================

// --- BAGIAN 1: IMPORT SEMUA LIBRARY ---
import express from 'express';
import cookieParser from 'cookie-parser';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';

// --- BAGIAN 2: SETUP APLIKASI DAN DATABASE ---
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const defaultData = { menuItems: [], orders: [] };
const db = new Low(adapter, defaultData);

// --- BAGIAN 3: SETUP MIDDLEWARE ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// --- BAGIAN 4: DEFINISI VARIABEL DAN FUNGSI BANTUAN ---
const ADMIN_PASSWORD = 'rusdi1234';
const checkAdmin = (req, res, next) => {
    if (req.cookies.isAdmin === 'true') {
        next();
    } else {
        res.redirect('/login');
    }
};

// --- BAGIAN 5: INISIALISASI DATABASE ---
async function initializeDatabase() {
    await db.read();
    if (!db.data.menuItems || db.data.menuItems.length === 0) {
        db.data.menuItems = [
            { id: 1, name: 'Nasi Goreng Spesial', price: 25000, image: 'https://i.pinimg.com/736x/94/82/ab/9482ab2e248d249e7daa7fd6924c8d3b.jpg', category: 'Makanan Berat' },
            { id: 2, name: 'Sate Ayam Madura', price: 30000, image: 'https://i.pinimg.com/736x/39/4a/1f/394a1f617445100857a584c51d7dd44e.jpg', category: 'Makanan Berat' },
            { id: 3, name: 'Soto Ayam Lamongan', price: 20000, image: 'https://i.pinimg.com/736x/d9/14/ee/d914eedf08d2a7c9e1463b155fd471b0.jpg', category: 'Makanan Berat' },
            { id: 4, name: 'Es Teh Manis', price: 5000, image: 'https://i.pinimg.com/736x/ab/30/7e/ab307ec373a3987d0151938bc9d4c5a1.jpg', category: 'Minuman' },
            { id: 5, name: 'Mie Goreng Jawa', price: 22000, image: 'https://i.pinimg.com/736x/0f/76/e8/0f76e8e797bf5d4e40f004475ffdbe16.jpg', category: 'Makanan Berat' },
            { id: 6, name: 'Ayam Bakar Taliwang', price: 35000, image: 'https://i.pinimg.com/736x/80/3c/bc/803cbcabba9e4f43b52ea660ac726b90.jpg', category: 'Makanan Berat' },
            { id: 7, name: 'Gado-Gado Betawi', price: 18000, image: 'https://i.pinimg.com/736x/e9/b6/5b/e9b65b09e0c7c0e75dd634360abb2a43.jpg', category: 'Makanan Ringan' },
            { id: 8, name: 'Bakso Urat Spesial', price: 27000, image: 'https://i.pinimg.com/736x/f7/6c/93/f76c93a3a23c2666e107ada4c4f33aec.jpg', category: 'Makanan Berat' },
            { id: 9, name: 'Es Jeruk Segar', price: 6000, image: 'https://i.pinimg.com/736x/59/bb/fd/59bbfd2e5107ecc820fc0a8f39e1620f.jpg', category: 'Minuman' },
            { id: 10, name: 'Kopi Susu Gula Aren', price: 15000, image: 'https://i.pinimg.com/736x/d5/e7/88/d5e788097e28dbafb5b7eb7c002e8acd.jpg', category: 'Minuman' },
            { id: 11, name: 'Teh Tarik Dingin', price: 12000, image: 'https://i.pinimg.com/736x/9b/80/7e/9b807e48a293f8e97f866fd574f252fc.jpg', category: 'Minuman' },
            { id: 12, name: 'Pisang Goreng Keju', price: 10000, image: 'https://i.pinimg.com/736x/cc/25/23/cc25236a216e164e3e0bc953af7f7baf.jpg', category: 'Makanan Ringan' }
        ];
    }
    if (!db.data.orders) {
        db.data.orders = [];
    }
    await db.write();
}
initializeDatabase();

// --- BAGIAN 6: SEMUA RUTE (ROUTES) APLIKASI ---

// --- BAGIAN 6: SEMUA RUTE (ROUTES) APLIKASI ---

// Rute Halaman
// ▼▼▼ TAMBAHKAN BARIS INI ▼▼▼
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// Rute lainnya yang sudah ada
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/admin', checkAdmin, (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/lacak', (req, res) => res.sendFile(path.join(__dirname, 'public', 'lacak.html')));

// Rute Proses Login
// ... (sisa kode Anda)
// Rute Proses Login
app.post('/login', (req, res) => {
    if (req.body.password === ADMIN_PASSWORD) {
        res.cookie('isAdmin', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        res.redirect('/admin');
    } else {
        res.redirect('/login?error=true');
    }
});

// --- SEMUA API LAINNYA ---
// (API untuk /api/menu, /api/order, /api/orders, dll. diletakkan di sini)
app.get('/api/menu', (req, res) => res.json(db.data.menuItems || []));
app.post('/api/order', async (req, res) => {
    const { customerName, items, total, orderType, locationInfo, paymentStatus } = req.body;
    if (!customerName || !items || !total || !orderType || !locationInfo || !paymentStatus) return res.status(400).json({ message: 'Data pesanan tidak lengkap!' });
    const newOrder = { orderId: `ORD-${Date.now()}`, customerName, items, total, orderType, locationInfo, paymentStatus, status: 'Baru', createdAt: new Date().toISOString() };
    if (!Array.isArray(db.data.orders)) db.data.orders = [];
    db.data.orders.push(newOrder);
    await db.write();
    console.log(`🎉 Pesanan Baru Diterima: ${newOrder.orderId}`);
    res.status(201).json({ message: 'Pesanan berhasil dibuat dan dibayar!', orderId: newOrder.orderId });
});
app.get('/api/orders/:orderId', (req, res) => {
    const { orderId } = req.params;
    const order = db.data.orders.find(o => o.orderId === orderId);
    if (order) res.json(order);
    else res.status(404).json({ message: 'Pesanan dengan ID tersebut tidak ditemukan.' });
});
app.get('/api/orders', (req, res) => {
    const orders = db.data.orders || [];
    res.json(orders.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
});
app.patch('/api/orders/:id/status', async (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ message: "Status tidak boleh kosong" });
    const orderIndex = db.data.orders.findIndex(order => order.orderId === orderId);
    if (orderIndex === -1) return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    db.data.orders[orderIndex].status = status;
    await db.write();
    res.json(db.data.orders[orderIndex]);
});
app.post('/api/menu', async (req, res) => {
    const { name, price, image, category } = req.body;
    const newMenuItem = { id: Date.now(), name, price: parseInt(price), image, category };
    db.data.menuItems.push(newMenuItem);
    await db.write();
    res.status(201).json(newMenuItem);
});
app.put('/api/menu/:id', async (req, res) => {
    const itemIndex = db.data.menuItems.findIndex(item => item.id === parseInt(req.params.id));
    if (itemIndex === -1) return res.status(404).json({ message: "Menu tidak ditemukan" });
    const { name, price, image, category } = req.body;
    db.data.menuItems[itemIndex] = { id: parseInt(req.params.id), name, price: parseInt(price), image, category };
    await db.write();
    res.json(db.data.menuItems[itemIndex]);
});
app.delete('/api/menu/:id', async (req, res) => {
    const itemIndex = db.data.menuItems.findIndex(item => item.id === parseInt(req.params.id));
    if (itemIndex === -1) return res.status(404).json({ message: "Menu tidak ditemukan" });
    db.data.menuItems.splice(itemIndex, 1);
    await db.write();
    res.status(200).json({ message: "Menu berhasil dihapus" });
});


export default app;