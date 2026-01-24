import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

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

      // Đảm bảo IP này đúng với server của bạn
      const response = await fetch(`http://192.168.100.220:5000/orders?email=${email}`);
      const data = await response.json();

      // Server đã sắp xếp DESC nên không cần .reverse() nếu đã có ORDER BY id DESC trong SQL
      setOrders(data);
    } catch (error) {
      console.error("Lỗi lấy đơn hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang xử lý';
      case 'Completed': return 'Đã hoàn thành';
      case 'Cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push({
        pathname: '/order-detail',
        params: { id: item.id }
      })}
    >
      <View style={styles.orderHeader}>
        <ThemedText style={styles.orderId}>Mã đơn: #{item.id}</ThemedText>
        <ThemedText style={[styles.status, { color: item.status === 'Completed' ? '#4CAF50' : '#F8B400' }]}>
          {getStatusText(item.status)}
        </ThemedText>
      </View>

      <View style={styles.divider} />

      {/* Hiển thị tóm tắt món ăn lấy từ display_items (GROUP_CONCAT từ Server) */}
      <ThemedText style={styles.productInfo} numberOfLines={2}>
        {item.display_items || "Không có dữ liệu món ăn"}
      </ThemedText>

      <View style={styles.orderFooter}>
        <ThemedText style={styles.dateText}>
          Ngày đặt: {new Date(item.created_at).toLocaleDateString('vi-VN')}
        </ThemedText>
        <ThemedText style={styles.totalText}>
          {Number(item.total_price).toLocaleString()}đ
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
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
          showsVerticalScrollIndicator={false}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', paddingTop: 50 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  backBtn: { padding: 5 },
  headerTitle: { marginLeft: 10, fontWeight: 'bold', fontSize: 20 },
  orderCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    // Hiệu ứng đổ bóng cho iOS và Android
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  status: { fontWeight: '700', fontSize: 14 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginBottom: 12 },
  productInfo: { color: '#666', fontSize: 14, marginBottom: 10, lineHeight: 20 },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
    paddingTop: 10
  },
  dateText: { fontSize: 13, color: '#999' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#FF4D4D' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', marginBottom: 100 }
});