import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // LƯU Ý: Thay '192.168.X.X' bằng địa chỉ IP thật của máy tính bạn (giống bên Login)
    const API_URL = 'http://192.168.5.1:5000/register';

    const handleRegister = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            setLoading(false);

            // Test xem code có chạy đến đây không bằng alert đơn giản nhất
            alert("Tạo tài khoản hành công " + response.status);

            if (response.ok) {
                router.push('/login');
            }
        } catch (error: any) { // Thêm : any để bỏ qua kiểm tra kiểu nghiêm ngặt
            setLoading(false);
            alert("Lỗi kết nối: " + (error.message || "Không xác định"));
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.emoji}>🍕</Text>
                <Text style={styles.title}>Tạo Tài Khoản</Text>
                <Text style={styles.subtitle}>Tham gia cộng đồng FastFood ngay</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Xác nhận mật khẩu"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
            </View>

            <TouchableOpacity
                style={[styles.registerButton, loading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>ĐĂNG KÝ NGAY</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.linkText}>
                    Đã có tài khoản? <Text style={styles.boldBlue}>Đăng nhập</Text>
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#fff', padding: 25, justifyContent: 'center' },
    headerBox: { alignItems: 'center', marginBottom: 35 },
    emoji: { fontSize: 60, marginBottom: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 16, color: '#666', marginTop: 5, textAlign: 'center' },
    inputContainer: { gap: 12, marginBottom: 25 },
    input: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#EEE'
    },
    registerButton: {
        backgroundColor: '#FF4D4D', // Màu đỏ cho nút đăng ký tạo điểm nhấn
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3
    },
    disabledButton: { backgroundColor: '#ccc' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    linkText: { marginTop: 20, textAlign: 'center', color: '#666', fontSize: 15 },
    boldBlue: { color: '#007AFF', fontWeight: 'bold' }
});