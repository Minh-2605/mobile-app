import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { addToCart } from '../cart-store';

// Sử dụng chung địa chỉ IP với file index
const API_URL = "http://192.168.100.220:5000/products";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Gọi API để lấy chi tiết 1 sản phẩm
  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      // Bạn có thể gọi API lấy toàn bộ rồi tìm, hoặc tạo API riêng /products/${id}
      const response = await fetch(API_URL);
      const data = await response.json();
      const product = data.find((f: any) => f.id.toString() === id);
      setItem(product);
    } catch (error) {
      console.error("Lỗi lấy chi tiết sản phẩm:", error);
      Alert.alert("Lỗi", "Không thể tải dữ liệu sản phẩm.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    if (item) {
      addToCart(item);
      Alert.alert(
        "Thành công",
        `Đã thêm món ${item.name} vào giỏ hàng!`,
        [{ text: "Đóng", style: "cancel" }]
      );
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#F8B400" style={{ flex: 1 }} />;
  if (!item) return <ThemedText style={{ textAlign: 'center', marginTop: 50 }}>Sản phẩm không tồn tại</ThemedText>;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: item.image }} style={styles.image} />

      <ThemedView style={styles.content}>
        <ThemedView style={styles.tagCategory}>
          <ThemedText style={styles.tagText}>{item.category}</ThemedText>
        </ThemedView>

        <ThemedText type="title" style={{ color: '#d78f31' }}>{item.name}</ThemedText>

        {/* Format giá tiền đồng bộ với trang index */}
        <ThemedText style={styles.price}>
          {typeof item.price === 'number' ? `${item.price.toLocaleString()}đ` : item.price}
        </ThemedText>

        <ThemedView style={styles.divider} />

        <ThemedText type="subtitle" style={{ color: '#c55858' }}>Mô tả món ăn</ThemedText>
        {/* Ưu tiên lấy description từ database */}
        <ThemedText style={styles.description}>{item.description || item.desc}</ThemedText>

        <TouchableOpacity
          style={styles.button}
          onPress={handleAdd}
        >
          <ThemedText style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
            THÊM VÀO GIỎ HÀNG
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={{ color: '#888' }}>Quay lại trang chính</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 350 },
  content: {
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    backgroundColor: '#fff',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5
  },
  tagCategory: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10
  },
  tagText: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  price: { fontSize: 26, fontWeight: 'bold', color: '#FF4D4D', marginVertical: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
  description: { lineHeight: 24, color: '#444', fontSize: 15 },
  button: { backgroundColor: '#F8B400', padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  backButton: { marginTop: 25, alignItems: 'center', paddingBottom: 30 }
});