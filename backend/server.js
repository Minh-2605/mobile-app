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

//API TIM KIEM
// Hàm loại bỏ dấu tiếng Việt đơn giản
function removeVietnameseTones(str) {
    str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
    str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
    str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
    str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
    str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
    str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
    str = str.replace(/đ/g, "d");
    str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
    str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
    str = str.replace(/Ì|Í|Ị|ỉ|Ĩ/g, "I");
    str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
    str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
    str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
    str = str.replace(/Đ/g, "D");
    return str.toLowerCase();
}

app.get('/search', async (req, res) => {
    const { name } = req.query;
    const allFoods = await Food.find({});

    // Lọc dữ liệu bằng cách chuẩn hóa cả hai phía
    const results = allFoods.filter(f =>
        removeVietnameseTones(f.name).includes(removeVietnameseTones(name))
    );

    res.json(results);
});




const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
    console.log("Chế độ: Lưu trữ bằng Mảng (RAM)");
});