import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function OrderDetailScreen() {
    const { id } = useLocalSearchParams();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Thay IP cho đúng với máy của bạn
        fetch(`http://192.168.5.1:5000/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                setOrder(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    if (loading) return (
        <View style={styles.center}><ActivityIndicator size="large" color="#F8B400" /></View>
    );

    if (!order) return (
        <View style={styles.center}><ThemedText>Không tìm thấy dữ liệu đơn hàng</ThemedText></View>
    );

    return (
        <ThemedView style={styles.container}>
            {/* Header có nút Back */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <ThemedText type="subtitle" style={styles.headerTitle}>Chi tiết đơn hàng #{id}</ThemedText>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Thông tin khách hàng */}
                <View style={styles.card}>
                    <ThemedText style={styles.sectionTitle}>Thông tin giao hàng</ThemedText>
                    <ThemedText style={styles.infoText}>👤 Người nhận: **{order.receiver_name}**</ThemedText>
                    <ThemedText style={styles.infoText}>📞 Số điện thoại: {order.phone}</ThemedText>
                    <ThemedText style={styles.infoText}>📍 Địa chỉ: {order.address}</ThemedText>
                    <ThemedText style={styles.infoText}>⏰ Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</ThemedText>
                </View>

                {/* Danh sách món ăn */}
                <View style={styles.card}>
                    <ThemedText style={styles.sectionTitle}>Sản phẩm đã đặt</ThemedText>
                    {order.items?.map((item: any, index: number) => (
                        <View key={index} style={styles.productRow}>
                            <ThemedText style={styles.productName}>{item.name} x{item.quantity}</ThemedText>
                            <ThemedText style={styles.productPrice}>
                                {(item.price * item.quantity).toLocaleString()}đ
                            </ThemedText>
                        </View>
                    ))}
                </View>

                {/* Tổng thanh toán */}
                <View style={[styles.card, styles.totalCard]}>
                    <View style={styles.row}>
                        <ThemedText style={styles.totalLabel}>Tổng thanh toán:</ThemedText>
                        <ThemedText style={styles.totalValue}>{Number(order.total_price).toLocaleString()}đ</ThemedText>
                    </View>
                    <ThemedText style={[styles.statusText, { color: order.status === 'Completed' ? '#4CAF50' : '#F8B400' }]}>
                        Trạng thái: {order.status === 'pending' ? 'Đang xử lý' : 'Đã hoàn thành'}
                    </ThemedText>
                </View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f8f8f8', paddingTop: 50 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { marginLeft: 15, fontWeight: 'bold' },
    card: { backgroundColor: '#fff', marginHorizontal: 15, marginBottom: 15, padding: 15, borderRadius: 12, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8B400', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 5 },
    infoText: { fontSize: 14, marginBottom: 8, color: '#444' },
    productRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
    productName: { fontSize: 14, flex: 1 },
    productPrice: { fontWeight: 'bold' },
    totalCard: { marginTop: 10 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 16, fontWeight: 'bold' },
    totalValue: { fontSize: 22, color: '#FF4D4D', fontWeight: 'bold' },
    statusText: { marginTop: 10, textAlign: 'right', fontWeight: 'bold', fontStyle: 'italic' }
});