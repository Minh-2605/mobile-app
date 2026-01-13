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

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log("Chế độ: MySQL (XAMPP)");
});