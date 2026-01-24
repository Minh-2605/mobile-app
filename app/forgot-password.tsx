import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPass, setNewPass] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [loading, setLoading] = useState(false); // Thêm trạng thái chờ

    const handleSendOTP = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://192.168.100.220:5000/send-otp", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                Alert.alert("Thông báo", "Mã xác thực đã được gửi tới Email của bạn!");
                setIsSent(true);
            } else {
                Alert.alert("Lỗi", "Email không tồn tại trong hệ thống!");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể kết nối tới máy chủ!");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!otp || !newPass) {
            Alert.alert("Lỗi", "Vui lòng nhập đủ mã OTP và mật khẩu mới");
            return;
        }

        try {
            const res = await fetch("http://192.168.100.220:5000/verify-otp-reset", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword: newPass })
            });

            if (res.ok) {
                router.replace('/login')
            } else {
                const errorData = await res.json();
                Alert.alert("Thất bại", errorData.error || "Mã OTP không đúng");
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể kết nối đến máy chủ");
        }
    };

    return (
        <ThemedView style={styles.container}>
            <View style={styles.headerBox}>
                <ThemedText style={styles.title}>Quên Mật Khẩu</ThemedText>
                <ThemedText style={styles.subtitle}>
                    {!isSent ? "Nhập email để nhận mã xác thực OTP" : "Nhập mã OTP 6 số và đặt mật khẩu mới"}
                </ThemedText>
            </View>

            <View style={styles.form}>
                {!isSent ? (
                    <>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email đăng ký"
                            style={styles.input}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            onPress={handleSendOTP}
                            style={styles.btn}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.btnText}>GỬI MÃ OTP</ThemedText>}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TextInput
                            value={otp}
                            onChangeText={setOtp}
                            placeholder="Nhập mã OTP 6 số"
                            style={styles.input}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                        <TextInput
                            value={newPass}
                            onChangeText={setNewPass}
                            placeholder="Mật khẩu mới"
                            secureTextEntry
                            style={styles.input}
                        />
                        <TouchableOpacity
                            onPress={handleReset}
                            style={styles.btn}
                            disabled={loading}
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.btnText}>XÁC NHẬN ĐỔI MẬT KHẨU</ThemedText>}
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ThemedText style={styles.backLink}>Quay lại đăng nhập</ThemedText>
                </TouchableOpacity>
            </View>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 25, justifyContent: 'center', backgroundColor: '#fff' },
    headerBox: { marginBottom: 30, alignItems: 'center' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    subtitle: { fontSize: 15, color: '#666', textAlign: 'center', paddingHorizontal: 20 },
    form: { width: '100%' },
    input: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#EEE',
        padding: 16,
        borderRadius: 12,
        marginBottom: 15,
        fontSize: 16,
        color: '#333'
    },
    btn: {
        backgroundColor: '#F8B400',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 10,
        // Hiệu ứng đổ bóng (Shadow)
        elevation: 4,
        shadowColor: '#F8B400',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
    backButton: { marginTop: 25 },
    backLink: { textAlign: 'center', color: '#007AFF', fontWeight: '600' }
});