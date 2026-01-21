import { View, FlatList, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

const API_URL = "http://192.168.5.1:5000/products"; 

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể kết nối đến server");
    } finally {
      setLoading(false);
    }
  };

  // Tự động tải lại dữ liệu khi quay lại trang này
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const handleDelete = (id: any) => {
  if (!id) {
    Alert.alert("Lỗi", "Không tìm thấy mã món ăn!");
    return;
  }

  Alert.alert("Xác nhận", "Xóa món ăn này khỏi danh sách?", [
    { text: "Hủy" },
    { 
      text: "Xóa", 
      style: 'destructive', 
      onPress: async () => {
        try {
          // Ép kiểu ID về String để gắn vào URL một cách an toàn
          const response = await fetch(`${API_URL}/${String(id)}`, { 
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            Alert.alert("Thành công", "Đã xóa món ăn!");
            fetchProducts(); 
          } else {
            const errRes = await response.json();
            Alert.alert("Lỗi", errRes.message || "Không thể xóa");
          }
        } catch (e) { 
          Alert.alert("Lỗi", "Kiểm tra kết nối mạng hoặc Server!");
        }
      }
    }
  ]);
};
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={{fontWeight: '800'}}>QUẢN LÝ MÓN ĂN</ThemedText>
        <TouchableOpacity onPress={() => router.push('/admin/add-product')}>
          <Ionicons name="add-circle" size={32} color="#F8B400" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#F8B400" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{paddingBottom: 40}}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Image source={{ uri: item.image }} style={styles.img} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={styles.itemPrice}>{item.price?.toLocaleString()}đ</ThemedText>
              </View>
              <View style={styles.actions}>
                {/* Sửa lỗi gạch đỏ bằng cách truyền object */}
                <TouchableOpacity onPress={() => router.push({
                    pathname: "/admin/edit/[id]",
                    params: { id: item.id }
                })}>
                  <Ionicons name="create-outline" size={24} color="#4A90E2" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => {
                    console.log("Dữ liệu món ăn đang nhấn:", item); // Xem log để biết tên cột ID chính xác
                    handleDelete(item.id); // Hoặc item.ID, item._id tùy vào database của bạn
                }}>
                <Ionicons name="trash-outline" size={24} color="#FF4D4D" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  itemCard: { 
    flexDirection: 'row', 
    padding: 12, 
    backgroundColor: '#F9FAFB',
    borderRadius: 15,
    marginBottom: 12, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  img: { width: 60, height: 60, borderRadius: 10 },
  itemName: { fontWeight: '700', fontSize: 16 },
  itemPrice: { color: '#FF4D4D', fontWeight: 'bold', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 18, paddingLeft: 10 }
});