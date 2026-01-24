import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // KIỂM TRA LẠI: Đảm bảo IP này trùng với IPv4 máy tính của bạn
    const API_URL = 'http://192.168.100.220:5000/login';

    const handleLogin = async () => {
        // 1. Kiểm tra đầu vào
        if (!email || !password) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ email và mật khẩu");
            return;
        }

        setLoading(true);
        try {
            // 2. Gửi yêu cầu tới Backend
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            // 3. Xử lý kết quả trả về
            if (response.ok) {
                // Lưu Token và Email như cũ
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userEmail', email);

                // QUAN TRỌNG: Lưu thêm Role (quyền hạn) nhận được từ Backend
                if (data.user && data.user.role) {
                    await AsyncStorage.setItem('userRole', data.user.role);
                }

                setTimeout(() => {
                    // Chuyển hướng sang trang chính
                    router.replace('/(tabs)');
                }, 100);
            } else {
                Alert.alert("Thất bại", data.message || "Email hoặc mật khẩu không đúng");
            }
        } catch (error: any) {
            Alert.alert("Lỗi kết nối", "Không thể kết nối tới server. Lỗi: " + (error.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.emoji}>🍔</Text>
                <Text style={styles.title}>FastFood Login</Text>
                <Text style={styles.subtitle}>Đăng nhập để đặt món ngay!</Text>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Email của bạn"
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
            </View>

            <TouchableOpacity
                style={[styles.loginButton, loading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>ĐĂNG NHẬP</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.linkText}>
                    Chưa có tài khoản? <Text style={styles.boldBlue}>Đăng ký ngay</Text>
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                <Text style={{ marginTop: 15, color: '#888' }}>Quên mật khẩu?</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#fff', padding: 25, justifyContent: 'center' },
    headerBox: { alignItems: 'center', marginBottom: 40 },
    emoji: { fontSize: 60, marginBottom: 10 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 16, color: '#666', marginTop: 5 },
    inputContainer: { gap: 15, marginBottom: 25 },
    input: {
        backgroundColor: '#F5F5F5',
        padding: 15,
        borderRadius: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#EEE'
    },
    loginButton: {
        backgroundColor: '#F8B400',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        elevation: 5
    },
    disabledButton: { backgroundColor: '#ccc' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    linkText: { marginTop: 20, textAlign: 'center', color: '#666', fontSize: 15 },
    boldBlue: { color: '#007AFF', fontWeight: 'bold' }
});