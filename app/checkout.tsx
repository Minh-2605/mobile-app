import { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import { globalCart, clearCart } from './cart-store';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // THÊM DÒNG NÀY

export default function CheckoutScreen() {
    const { total } = useLocalSearchParams();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    
    const [shippingMethod, setShippingMethod] = useState<'normal' | 'fast'>('normal');

    const shippingFee = shippingMethod === 'normal' ? 5000 : 20000;
    const finalTotal = Number(total) + shippingFee;

    const handleConfirmOrder = async () => {
        // 1. Kiểm tra thông tin nhập vào
        if (!name.trim() || !phone.trim() || !address.trim()) {
            Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
            return;
        }

        if (isNaN(Number(phone))) {
            Alert.alert("Lỗi", "Số điện thoại phải là số");
            return;
        }

        try {
            // 2. Lấy Email người dùng đang đăng nhập
            const userEmail = await AsyncStorage.getItem('userEmail');

            console.log("Bắt đầu gửi đơn hàng cho:", userEmail);
            
            const response = await fetch("http://192.168.5.1:5000/checkout", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    receiver_name: name,
                    phone: phone,
                    address: address,
                    total_price: finalTotal,
                    items: globalCart,
                    email: userEmail // Gửi với key là 'email'
                })
            });

            if (response.ok) {
                clearCart();
                Alert.alert("Thành công", "Đơn hàng của bạn đã được ghi nhận");
                router.replace('/');
            } else {
                const errorRes = await response.json();
                Alert.alert("Lỗi", errorRes.error || "Server từ chối đơn hàng");
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến máy tính. Hãy kiểm tra IP!");
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

                <ThemedText style={styles.label}>Phương thức giao hàng</ThemedText>
                
                <View style={styles.radioContainer}>
                    <TouchableOpacity 
                        style={styles.radioItem} 
                        onPress={() => setShippingMethod('normal')}
                    >
                        <Ionicons 
                            name={shippingMethod === 'normal' ? "radio-button-on" : "radio-button-off"} 
                            size={24} 
                            color={shippingMethod === 'normal' ? "#F8B400" : "#ccc"} 
                        />
                        <View style={styles.radioTextContainer}>
                            <ThemedText style={styles.methodName}>Giao hàng bình thường</ThemedText>
                            <ThemedText style={styles.methodFee}>+5.000đ</ThemedText>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.radioItem} 
                        onPress={() => setShippingMethod('fast')}
                    >
                        <Ionicons 
                            name={shippingMethod === 'fast' ? "radio-button-on" : "radio-button-off"} 
                            size={24} 
                            color={shippingMethod === 'fast' ? "#F8B400" : "#ccc"} 
                        />
                        <View style={styles.radioTextContainer}>
                            <ThemedText style={styles.methodName}>Giao hàng hỏa tốc</ThemedText>
                            <ThemedText style={styles.methodFee}>+20.000đ</ThemedText>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.priceDetail}>
                    <ThemedText>Tiền hàng: {Number(total).toLocaleString()}đ</ThemedText>
                    <ThemedText>Phí vận chuyển: {shippingFee.toLocaleString()}đ</ThemedText>
                    <ThemedText style={styles.totalText}>
                        Tổng thanh toán: {finalTotal.toLocaleString()}đ
                    </ThemedText>
                </View>

                <TouchableOpacity style={styles.btn} onPress={handleConfirmOrder}>
                    <ThemedText style={styles.btnText}>XÁC NHẬN ĐẶT HÀNG</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    form: { padding: 20, paddingTop: 40 },
    title: { marginBottom: 30, color: '#F8B400' },
    label: { marginBottom: 10, fontWeight: 'bold' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 20 },
    radioContainer: { backgroundColor: '#f9f9f9', borderRadius: 15, padding: 10, marginBottom: 20 },
    radioItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10 },
    radioTextContainer: { marginLeft: 15, flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    methodName: { fontSize: 16 },
    methodFee: { color: '#666', fontWeight: 'bold' },
    priceDetail: { marginTop: 10, alignItems: 'flex-end' },
    totalText: { fontSize: 20, fontWeight: 'bold', color: '#FF4D4D', marginTop: 5, marginBottom: 20 },
    btn: { backgroundColor: '#F8B400', padding: 18, borderRadius: 15, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});