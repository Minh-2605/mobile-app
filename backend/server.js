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



const moment = require('moment');
const crypto = require('crypto');
const qs = require('qs');

app.post('/create-vnpay-qr', (req, res) => {
    const { amount } = req.body;
    const date = new Date();
    const createDate = moment(date).format('YYYYMMDDHHmmss');
    
    // ĐIỀN MÃ BẠN LẤY TỪ EMAIL VÀO ĐÂY
    const tmnCode = "2QXG2YWS"; 
    const secretKey = "XNBCJ7H2983DB233BDBS";
    
    const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    const returnUrl = "myapp://payment-result"; 

    let vnp_Params = {
        'vnp_Version': '2.1.0',
        'vnp_Command': 'pay',
        'vnp_TmnCode': tmnCode,
        'vnp_Locale': 'vn',
        'vnp_CurrCode': 'VND',
        'vnp_TxnRef': moment(date).format('HHmmss'), 
        'vnp_OrderInfo': 'Thanh toan qua QR',
        'vnp_OrderType': 'other',
        'vnp_Amount': amount * 100, // VNPAY tính theo đơn vị đồng x 100
        'vnp_ReturnUrl': returnUrl,
        'vnp_IpAddr': '127.0.0.1',
        'vnp_CreateDate': createDate,
    };

    // Sắp xếp tham số theo alphabet (Bắt buộc)
    vnp_Params = Object.keys(vnp_Params).sort().reduce((obj, key) => {
        obj[key] = vnp_Params[key];
        return obj;
    }, {});

    // Tạo chữ ký bảo mật
    const signData = qs.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;

    const finalUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });
    res.json({ paymentUrl: finalUrl });
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log("Chế độ: MySQL (XAMPP)");
});



