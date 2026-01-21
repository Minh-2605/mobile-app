import { View, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = "http://192.168.5.1:5000/products";

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Lấy ID từ URL
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '', price: '', category: '', image: '', description: ''
  });

  // Lấy dữ liệu cũ của sản phẩm để đổ vào form
  useEffect(() => {
    fetch(`${API_URL}/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm({
          name: data.name,
          price: data.price.toString(),
          category: data.category,
          image: data.image,
          description: data.description || ''
        });
        setLoading(false);
      })
      .catch(() => Alert.alert("Lỗi", "Không thể lấy thông tin sản phẩm"));
  }, [id]);

  const handleUpdate = async () => {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT', // Dùng phương thức PUT để cập nhật
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: parseInt(form.price) }),
      });

      if (response.ok) {
        Alert.alert("Thành công", "Đã cập nhật thông tin món ăn");
        router.back();
      }
    } catch (error) {
      Alert.alert("Lỗi", "Cập nhật thất bại");
    }
  };

  if (loading) return <ActivityIndicator style={{marginTop: 50}} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={24} /></TouchableOpacity>
        <ThemedText type="subtitle">Chỉnh sửa món ăn</ThemedText>
        <View style={{width: 24}} />
      </View>

      <View style={styles.form}>
        <ThemedText style={styles.label}>Tên món</ThemedText>
        <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm({...form, name: t})} />

        <ThemedText style={styles.label}>Giá (VNĐ)</ThemedText>
        <TextInput style={styles.input} keyboardType="numeric" value={form.price} onChangeText={(t) => setForm({...form, price: t})} />

        <ThemedText style={styles.label}>Link ảnh</ThemedText>
        <TextInput style={styles.input} value={form.image} onChangeText={(t) => setForm({...form, image: t})} />

        <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate}>
          <ThemedText style={{color: '#fff', fontWeight: 'bold'}}>LƯU THAY ĐỔI</ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  form: { padding: 20 },
  label: { marginTop: 15, fontWeight: '600' },
  input: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, marginTop: 5 },
  submitBtn: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 15, marginTop: 30, alignItems: 'center' }
});