import { View, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = "http://192.168.5.1:5000/products"; // Thay bằng IP server của bạn

const CATEGORIES = [
  { label: 'Burger', value: 'burger' },
  { label: 'Pizza', value: 'pizza' },
  { label: 'Gà rán', value: 'Gà rán' },
  { label: 'Khoai tây', value: 'Khoai tây' },
  { label: 'Đồ uống', value: 'Đồ uống' },
  { label: 'Mì Ý', value: 'Mì Ý' },
];

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Lấy ID từ URL
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
    image: '',
    description: ''
  });

  // Tải dữ liệu cũ của sản phẩm khi vào trang
  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    try {
      const res = await fetch(`${API_URL}/${id}`);
      const data = await res.json();
      if (res.ok) {
        setForm({
          name: data.name,
          price: data.price.toString(),
          category: data.category,
          image: data.image,
          description: data.description || ''
        });
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải dữ liệu sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!form.name || !form.price || !form.category || !form.image) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc (*)");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price)
        }),
      });

      if (response.ok) {
        Alert.alert("Thành công", "Đã cập nhật thông tin!");
        router.back();
      } else {
        Alert.alert("Lỗi", "Cập nhật thất bại");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể kết nối server");
    }
  };

  if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <ThemedText type="subtitle" style={styles.headerTitle}>Chỉnh sửa món ăn</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.form}>
        <ThemedText style={styles.label}>Tên món *</ThemedText>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(txt) => setForm({ ...form, name: txt })}
        />

        <ThemedText style={styles.label}>Giá (VNĐ) *</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={form.price}
          onChangeText={(txt) => setForm({ ...form, price: txt })}
        />

        <ThemedText style={styles.label}>Danh mục *</ThemedText>
        <TouchableOpacity style={styles.dropdown} onPress={() => setIsModalVisible(true)}>
          <ThemedText>{CATEGORIES.find(c => c.value === form.category)?.label || "Chọn danh mục"}</ThemedText>
          <Ionicons name="chevron-down" size={20} color="gray" />
        </TouchableOpacity>

        <ThemedText style={styles.label}>Link ảnh *</ThemedText>
        <TextInput
          style={styles.input}
          value={form.image}
          onChangeText={(txt) => setForm({ ...form, image: txt })}
        />

        <ThemedText style={styles.label}>Mô tả</ThemedText>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          placeholder="Mô tả về món ăn..."
          value={form.description}
          onChangeText={(txt) => setForm({ ...form, description: txt })}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleUpdate}>
          <ThemedText style={styles.submitText}>LƯU THAY ĐỔI</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Modal chọn danh mục */}
      <Modal visible={isModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => { setForm({ ...form, category: item.value }); setIsModalVisible(false); }}
                >
                  <ThemedText>{item.label}</ThemedText>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontWeight: 'bold' },
  form: { padding: 20 },
  label: { fontWeight: '600', marginTop: 15, marginBottom: 5 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12 },
  dropdown: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between' },
  submitBtn: { backgroundColor: '#4A90E2', padding: 15, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 40 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 10 },
  option: { padding: 15, borderBottomWidth: 0.5, borderBottomColor: '#eee' }
});