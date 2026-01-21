const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2'); // 1. Import mysql2
const app = express();
app.use(express.json());
app.use(cors());
app.use(cors({
    origin: '*', // Cho phép tất cả các nguồn
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Bắt buộc phải có DELETE ở đây
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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

        // Tạo token mang theo cả role để bảo mật hơn
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

        // Trả về thêm thông tin user để App lưu vào AsyncStorage
        res.json({
            message: "Đăng nhập thành công!",
            token,
            user: {
                email: user.email,
                role: user.role // 'admin' hoặc 'user'
            }
        });
    } catch (error) {
        console.error(error);
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


const nodemailer = require('nodemailer');

// 1. Cấu hình gửi email dùng App Password (16 ký tự)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'phananhminhzxy@gmail.com', // Phải là email này
        pass: 'jhij idui nndp cvvy'      // 16 ký tự App Password của Google
    }
});

// Thêm đoạn này để kiểm tra lỗi ngay khi chạy Server
transporter.verify((error, success) => {
    if (error) {
        console.log("Lỗi cấu hình Email:", error);
    } else {
        console.log("Server đã sẵn sàng gửi OTP!");
    }
});

let otpStore = {}; // Lưu mã OTP tạm thời: { email: otp_code }

// 2. API Gửi OTP
app.post('/send-otp', (req, res) => {
    const { email } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) {
            return res.status(404).json({ error: "Email không tồn tại!" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // PHẢI THÊM DÒNG NÀY: Lưu mã vào bộ nhớ tạm để xác thực sau này
        otpStore[email] = otp;

        const mailOptions = {
            from: 'phananhminhzxy@gmail.com',
            to: email,
            subject: 'Mã OTP xác nhận',
            text: `Mã OTP của bạn là: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Lỗi gửi mail:", error);
                return res.status(500).json({ error: "Lỗi gửi email" });
            }
            res.json({ message: "OTP đã được gửi thành công!" });
        });
    });
});

// 3. API Xác nhận OTP và Đổi mật khẩu
app.post('/verify-otp-reset', async (req, res) => { // Thêm async ở đây
    const { email, otp, newPassword } = req.body;

    if (otpStore[email] && otpStore[email] === otp) {
        try {
            // MÃ HÓA MẬT KHẨU MỚI TRƯỚC KHI LƯU
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            const sql = "UPDATE users SET password = ? WHERE email = ?";
            db.query(sql, [hashedPassword, email], (err, result) => {
                if (err) return res.status(500).json({ error: "Lỗi database" });
                delete otpStore[email];
                res.json({ message: "Mật khẩu đã được thay đổi thành công!" });
            });
        } catch (error) {
            res.status(500).json({ error: "Lỗi mã hóa mật khẩu" });
        }
    } else {
        res.status(400).json({ error: "Mã OTP không đúng hoặc đã hết hạn" });
    }
});

// API: Thay đổi mật khẩu từ trang cá nhân
app.post('/change-password', async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        // 1. Tìm user trong MySQL
        const [rows] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

        // 2. Kiểm tra mật khẩu cũ có khớp với mã Hash trong DB không
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
        }

        // 3. Hash mật khẩu mới và UPDATE
        const hashedNew = await bcrypt.hash(newPassword, 10);
        await db.promise().query('UPDATE users SET password = ? WHERE email = ?', [hashedNew, email]);

        res.json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi Server" });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log("Chế độ: MySQL (XAMPP)");
});


app.get('/orders', (req, res) => {
    const email = req.query.email;
    if (!email) return res.status(400).json({ error: "Thiếu email" });

    // Câu lệnh lấy đơn hàng và gộp tên sản phẩm thành chuỗi "Tên x SL"
    const sql = `
        SELECT o.*, 
        (SELECT GROUP_CONCAT(CONCAT(p.name, ' x', oi.quantity) SEPARATOR ', ') 
         FROM order_items oi 
         JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = o.id) as display_items
        FROM orders o 
        WHERE o.email = ? 
        ORDER BY o.id DESC`;

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Lỗi SQL:", err);
            return res.status(500).json(err);
        }
        res.json(results);
    });
});

app.post('/checkout', (req, res) => {
    // Lấy dữ liệu từ App gửi lên
    // CHÚ Ý: Phải có 'email' ở đây để không bị lỗi "not defined"
    const { receiver_name, phone, address, items, email } = req.body;
    const total_price = Number(req.body.total_price);

    // Kiểm tra số điện thoại
    const isNumeric = /^\d+$/.test(phone);
    if (!isNumeric) {
        return res.status(400).json({ error: "Số điện thoại không hợp lệ" });
    }

    // Lưu vào bảng orders (Sử dụng cột email bạn đã thêm vào DB)
    const sqlOrder = "INSERT INTO orders (receiver_name, phone, address, total_price, email) VALUES (?, ?, ?, ?, ?)";

    db.query(sqlOrder, [receiver_name, phone, address, total_price, email], (err, result) => {
        if (err) {
            console.error("Lỗi lưu orders:", err);
            return res.status(500).json({ error: err.message });
        }

        const orderId = result.insertId;

        // Lưu chi tiết sản phẩm vào order_items
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
            res.json({ message: "Đặt hàng thành công!", orderId: orderId });
        });
    });
});

app.get('/orders/:id', (req, res) => {
    const orderId = req.params.id;

    // 1. Lấy thông tin đơn hàng (người nhận, phone, địa chỉ...)
    const sqlOrder = "SELECT * FROM orders WHERE id = ?";

    // 2. Lấy chi tiết từng món ăn trong đơn hàng đó
    const sqlItems = `
        SELECT oi.*, p.name 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?`;

    db.query(sqlOrder, [orderId], (err, orderResults) => {
        if (err) return res.status(500).json(err);
        if (orderResults.length === 0) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

        db.query(sqlItems, [orderId], (err2, itemResults) => {
            if (err2) return res.status(500).json(err2);

            // Gộp thông tin đơn và danh sách món để gửi về App
            res.json({
                ...orderResults[0],
                items: itemResults
            });
        });
    });
});

// Lấy danh sách sản phẩm (đã có)
// Thêm sản phẩm mới
app.post('/products', (req, res) => {
    const { name, price, category, image, description } = req.body;
    const query = "INSERT INTO products (name, price, category, image, description) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [name, price, category, image, description], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: "Thêm thành công", id: result.insertId });
    });
});
// API Xóa sản phẩm
app.delete('/products/:id', (req, res) => {
    const productId = req.params.id;
    console.log("===> Server nhận yêu cầu xóa ID:", productId); // Kiểm tra log tại terminal

    // Sử dụng cột 'id' viết thường như bạn đã xác nhận
    const sql = "DELETE FROM products WHERE id = ?";
    db.query(sql, [productId], (err, result) => {
        if (err) {
            console.error("Lỗi MySQL:", err);
            return res.status(500).json({ message: "Lỗi hệ thống", error: err });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm để xóa" });
        }

        res.json({ message: "Xóa thành công" });
    });
});
// API Thêm sản phẩm mới
app.post('/products', (req, res) => {
    const { name, price, category, image, description } = req.body;
    const sql = "INSERT INTO products (name, price, category, image, description) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [name, price, category, image, description], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Thêm thành công", id: result.insertId });
    });
});
// 1. API Lấy chi tiết 1 sản phẩm để hiện lên form Edit
app.get('/products/:id', (req, res) => {
    const { id } = req.params;
    db.query("SELECT * FROM products WHERE id = ?", [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result[0]); // Trả về món ăn đầu tiên tìm thấy
    });
});

// 2. API Cập nhật sản phẩm
app.put('/products/:id', (req, res) => {
    const { id } = req.params;
    const { name, price, category, image, description } = req.body;
    const sql = "UPDATE products SET name=?, price=?, category=?, image=?, description=? WHERE id=?";
    db.query(sql, [name, price, category, image, description, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Cập nhật thành công" });
    });
});