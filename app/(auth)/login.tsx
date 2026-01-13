import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // KIỂM TRA LẠI: Đảm bảo IP này trùng với IPv4 máy tính của bạn
    const API_URL = 'http://192.168.5.1:5000/login';

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
                await AsyncStorage.setItem('userToken', data.token);
                await AsyncStorage.setItem('userEmail', email);

                setTimeout(() => {
                    // Thử thay đổi sang đường dẫn trực tiếp của file index
                    router.replace('/(tabs)');
                    // Hoặc nếu vẫn không được, hãy thử: router.push('/(tabs)');
                }, 100);
            } else {
                Alert.alert("Thất bại", data.message || "Email hoặc mật khẩu không đúng");
            }
        } catch (error: any) {
            // Sửa lỗi 'unknown' type bằng cách thêm : any
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