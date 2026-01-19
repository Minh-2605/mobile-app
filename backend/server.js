const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2'); // 1. Import mysql2

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = "bi-mat-cua-toi-123";

// 2. Kết nối tới XAMPP MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // Mặc định của XAMPP
    password: '',      // Mặc định của XAMPP để trống
    database: 'food_app' // Tên database bạn đã tạo trong phpMyAdmin
});

db.connect(err => {
    if (err) {
        console.error("❌ Lỗi kết nối MySQL:", err.message);
    } else {
        console.log("✅ Đã kết nối Database MySQL qua XAMPP");
    }
});

// --- API ĐĂNG KÝ ---
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kiểm tra email tồn tại trong DB
        const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: "Email này đã được sử dụng!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Lưu vào bảng users
        await db.promise().query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);

        res.status(201).json({ message: "Đăng ký thành công!" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống", error });
    }
});

// --- API ĐĂNG NHẬP ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(400).json({ message: "Người dùng không tồn tại!" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Mật khẩu không đúng!" });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Đăng nhập thành công!", token });
    } catch (error) {
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
});

// --- API LẤY TẤT CẢ SẢN PHẨM & TÌM KIẾM ---
app.get('/products', async (req, res) => {
    const { name } = req.query;
    try {
        let query = 'SELECT * FROM products';
        let params = [];

        if (name) {
            query += ' WHERE name LIKE ?';
            params.push(`%${name}%`); // Tìm kiếm theo từ khóa
        }

        const [results] = await db.promise().query(query, params);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Lỗi lấy dữ liệu sản phẩm" });
    }
});


app.post('/checkout', (req, res) => {
    const total_price = Number(req.body.total_price);
    const { receiver_name, phone, address, items } = req.body;

    // Bước 1: Lưu thông tin đơn hàng và người nhận vào bảng orders
    const sqlOrder = "INSERT INTO orders (receiver_name, phone, address, total_price) VALUES (?, ?, ?, ?)";

    const isNumeric = /^\d+$/.test(phone);

    if (!isNumeric) {
        return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
    }

    db.query(sqlOrder, [receiver_name, phone, address, total_price], (err, result) => {
        if (err) {
            console.error("Lỗi lưu orders:", err);
            return res.status(500).json({ error: err.message });
        }

        const orderId = result.insertId; // Lấy ID của đơn hàng vừa tạo

        // Bước 2: Chuẩn bị dữ liệu để lưu nhiều món ăn cùng lúc vào order_items
        // Xử lý giá tiền để đảm bảo luôn là số
        const itemValues = items.map(item => [
            orderId,
            item.id,
            item.quantity,
            typeof item.price === 'number' ? item.price : parseInt(item.price.toString().replace(/[^0-9]/g, ''))
        ]);

        const sqlItems = "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?";

        db.query(sqlItems, [itemValues], (err2) => {
            if (err2) {
                console.error("Lỗi lưu order_items:", err2);
                return res.status(500).json({ error: err2.message });
            }

            console.log(`Đơn hàng #${orderId} đã được lưu thành công!`);
            res.json({ message: "Đặt hàng thành công!", orderId: orderId });
        });
    });
});





const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log("Chế độ: MySQL (XAMPP)");
});



