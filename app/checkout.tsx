import { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import { globalCart, clearCart } from './cart-store'; // Đảm bảo bạn có hàm clearCart


export default function CheckoutScreen() {
    const { total } = useLocalSearchParams();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');


    const handleConfirmOrder = async () => {
        // 1. Kiểm tra trống
        if (!name.trim() || !phone.trim() || !address.trim()) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        // 2. Kiểm tra số
        if (isNaN(Number(phone))) {
            Alert.alert("Lỗi", "Số điện thoại phải là số");
            return;
        }

        try {
            console.log("Bắt đầu gửi đơn hàng...");
            const response = await fetch("http://192.168.100.220:5000/checkout", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiver_name: name,
                    phone: phone,
                    address: address,
                    total_price: Number(total),
                    items: globalCart
                })
            });

            if (response.ok) {
                console.log("Server phản hồi OK");

                // XÓA GIỎ HÀNG TRƯỚC
                clearCart();

                router.replace('/');
            } else {
                const errorRes = await response.json();
                Alert.alert("Lỗi", errorRes.error || "Server từ chối đơn hàng");
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến máy tính. Hãy kiểm tra IP !");
        }
    };

    return (
        <ScrollView style={styles.container}>
            <ThemedView style={styles.form}>
                <ThemedText type="title" style={styles.title}>Thông tin giao hàng</ThemedText>

                <ThemedText style={styles.label}>Tên người nhận</ThemedText>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nguyễn Văn A" />

                <ThemedText style={styles.label}>Số điện thoại</ThemedText>
                <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="090xxxxxxx" keyboardType="phone-pad" />

                <ThemedText style={styles.label}>Địa chỉ nhận hàng</ThemedText>
                <TextInput style={[styles.input, { height: 80 }]} value={address} onChangeText={setAddress} placeholder="Số nhà, tên đường..." multiline />

                <ThemedText style={styles.totalText}>Tổng thanh toán: {Number(total).toLocaleString()}đ</ThemedText>

                <TouchableOpacity style={styles.btn} onPress={handleConfirmOrder}>
                    <ThemedText style={styles.btnText}>XÁC NHẬN ĐẶT HÀNG</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btn}
                    onPress={() =>
                        router.push({
                            pathname: '/vnpay',
                            params: { total: total } // TRUYỀN SỐ TIỀN SANG ĐÂY
                        })
                    }
                >
                    <ThemedText style={styles.btnText}>THANH TOÁN BẰNG QR</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    form: { padding: 20, paddingTop: 40 },
    title: { marginBottom: 30, color: '#F8B400' },
    label: { marginBottom: 5, fontWeight: 'bold' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 20 },
    totalText: { fontSize: 20, fontWeight: 'bold', color: '#FF4D4D', textAlign: 'right', marginVertical: 20 },
    btn: { backgroundColor: '#F8B400', padding: 18, borderRadius: 15, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

});