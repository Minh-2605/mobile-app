const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

// Mảng lưu trữ người dùng tạm thời (Sẽ mất khi bạn tắt server)
const users = [];
const JWT_SECRET = "bi-mat-cua-toi-123";

// API ĐĂNG KÝ
app.post('/register', async (req, res) => {
    console.log("==> Nhận yêu cầu Đăng ký:", req.body);
    const { email, password } = req.body;

    // Kiểm tra email tồn tại
    const userExists = users.find(u => u.email === email);
    if (userExists) {
        return res.status(400).json({ message: "Email này đã được sử dụng!" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now(), email, password: hashedPassword };

    users.push(newUser);
    console.log("✅ Đăng ký thành công:", email);
    res.status(201).json({ message: "Đăng ký thành công!" });
});

// API ĐĂNG NHẬP
app.post('/login', async (req, res) => {
    console.log("==> Nhận yêu cầu Đăng nhập:", req.body);
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
        return res.status(400).json({ message: "Người dùng không tồn tại!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Mật khẩu không đúng!" });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
    console.log("✅ Đăng nhập thành công:", email);
    res.json({ message: "Đăng nhập thành công!", token });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log("Chế độ: Lưu trữ bằng Mảng (RAM)");
});