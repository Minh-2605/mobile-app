import { StyleSheet, FlatList, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const email = await AsyncStorage.getItem('userEmail');
      if (!email) return;

      // Thay đổi IP theo máy của bạn (giống trong checkout.tsx)
      const response = await fetch(`http://192.168.5.1:5000/orders?email=${email}`);
      const data = await response.json();
      
      // Sắp xếp đơn hàng mới nhất lên đầu
      setOrders(data.reverse()); 
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };
    const getStatusText = (status: string) => {
    switch (status) {
        case 'pending':
        return 'Đang xử lý';
        case 'Completed':
        return 'Đã hoàn thành';
        case 'Cancelled':
        return 'Đã hủy';
        default:
        return status;
    }
    };
  const renderOrderItem = ({ item }: { item: any }) => (
  <View style={styles.orderCard}>
    <View style={styles.orderHeader}>
      <ThemedText style={styles.orderId}>Mã đơn: #{item.id}</ThemedText>
      <ThemedText style={[styles.status, { color: item.status === 'Completed' ? '#4CAF50' : '#F8B400' }]}>
        {getStatusText(item.status)}
    </ThemedText>
    </View>

    <View style={styles.divider} />

    {/* Hiển thị chuỗi sản phẩm đã gộp từ Server */}
    <ThemedText style={styles.productInfo}>
       {item.display_items || "Không có dữ liệu món ăn"}
    </ThemedText>

    <View style={styles.orderFooter}>
      <ThemedText style={styles.dateText}>
        Ngày đặt: {new Date(item.created_at).toLocaleDateString('vi-VN')}
      </ThemedText>
      <ThemedText style={styles.totalText}>{item.total_price?.toLocaleString()}đ</ThemedText>
    </View>
  </View>
);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>Lịch sử đơn hàng</ThemedText>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F8B400" style={{ marginTop: 50 }} />
      ) : orders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="cart-outline" size={80} color="#CCC" />
          <ThemedText style={{ color: '#888', marginTop: 10 }}>Bạn chưa có đơn hàng nào.</ThemedText>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          contentContainerStyle={{ padding: 15 }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { marginLeft: 15, fontWeight: 'bold' },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  status: { fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#EEE', marginBottom: 10 },
  productInfo: { color: '#666', fontSize: 14, marginBottom: 4 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, alignItems: 'center' },
  dateText: { fontSize: 12, color: '#999' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#FF4D4D' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 100 }
});