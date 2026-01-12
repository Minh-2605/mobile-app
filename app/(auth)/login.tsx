import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // LƯU Ý: Thay '192.168.1.X' bằng địa chỉ IP thật của máy tính bạn
    const API_URL = 'http://192.168.100.220:5000/login';

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ email và mật khẩu");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Lưu Token vào bộ nhớ máy để dùng cho các API sau này
                await AsyncStorage.setItem('userToken', data.token);
                Alert.alert("Thành công", "Chào mừng bạn quay trở lại!");
                router.replace('/(tabs)'); // Vào trang chủ index.tsx
            } else {
                Alert.alert("Thất bại", data.message || "Email hoặc mật khẩu không đúng");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể kết nối tới server. Hãy kiểm tra địa chỉ IP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 25, justifyContent: 'center' },
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
        shadowColor: '#F8B400',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5
    },
    disabledButton: { backgroundColor: '#ccc' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    linkText: { marginTop: 20, textAlign: 'center', color: '#666', fontSize: 15 },
    boldBlue: { color: '#007AFF', fontWeight: 'bold' }
});