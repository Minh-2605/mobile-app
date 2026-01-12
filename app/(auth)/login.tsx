import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = () => {
        // Xử lý logic đăng nhập ở đây
        console.log("Login with:", email, password);
        // Sau khi đăng nhập thành công, chuyển hướng về trang chủ
        router.replace('/(tabs)');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Đăng Nhập</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <Button title="Đăng nhập" onPress={handleLogin} />

            <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={styles.linkText}>Chưa có tài khoản? Đăng ký ngay</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
    linkText: { color: 'blue', marginTop: 15, textAlign: 'center' }
});