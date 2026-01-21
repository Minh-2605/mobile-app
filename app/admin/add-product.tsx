import { View, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const API_URL = "http://192.168.5.1:5000/products";

// Danh sách các danh mục cố định
const CATEGORIES = [
  { label: 'Burger', value: 'burger' },
  { label: 'Pizza', value: 'pizza' },
  { label: 'Gà rán', value: 'Gà rán' },
  { label: 'Khoai tây', value: 'Khoai tây' },
  { label: 'Đồ uống', value: 'Đồ uống' },
  { label: 'Mì Ý', value: 'Mì Ý' },
];

export default function AddProductScreen() {
  const router = useRouter();
  const [isModalVisible, setIsModalVisible] = useState(false); // Trạng thái đóng/mở danh sách chọn
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '', // Lưu value của danh mục chọn
    image: '',
    description: ''
  });

  const handleAdd = async () => {
    if (!form.name || !form.price || !form.category || !form.image) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ các trường bắt buộc (*)");
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseInt(form.price)
        }),
      });

      if (response.ok) {
        Alert.alert("Thành công", "Đã thêm món ăn mới!");
        router.back();
      }
    } catch (error) {
      Alert.alert("Lỗi kết nối", "Vui lòng kiểm tra server");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        <ThemedText type="subtitle">Thêm món ăn mới</ThemedText>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.form}>
        <ThemedText style={styles.label}>Tên món ăn *</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Burger Gà Cay"
          value={form.name}
          onChangeText={(txt) => setForm({ ...form, name: txt })}
        />

        <ThemedText style={styles.label}>Giá tiền (VNĐ) *</ThemedText>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Ví dụ: 50000"
          value={form.price}
          onChangeText={(txt) => setForm({ ...form, price: txt })}
        />

        {/* PHẦN DROP LIST CHỌN DANH MỤC */}
        <ThemedText style={styles.label}>Danh mục *</ThemedText>
        <TouchableOpacity
          style={styles.dropdownTrigger}
          onPress={() => setIsModalVisible(true)}
        >
          <ThemedText style={{ color: form.category ? '#000' : '#999' }}>
            {form.category ? CATEGORIES.find(c => c.value === form.category)?.label : "Chọn danh mục..."}
          </ThemedText>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <ThemedText style={styles.label}>Link hình ảnh *</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Dán link ảnh (https://...)"
          value={form.image}
          onChangeText={(txt) => setForm({ ...form, image: txt })}
        />

        <ThemedText style={styles.label}>Mô tả</ThemedText>
        <TextInput
          style={[styles.input, { height: 100 }]}
          multiline
          placeholder="Hương vị thơm ngon..."
          value={form.description}
          onChangeText={(txt) => setForm({ ...form, description: txt })}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleAdd}>
          <ThemedText style={styles.submitText}>XÁC NHẬN THÊM</ThemedText>
        </TouchableOpacity>
      </View>

      {/* MODAL DANH SÁCH CHỌN */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Chọn danh mục</ThemedText>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryOption}
                  onPress={() => {
                    setForm({ ...form, category: item.value });
                    setIsModalVisible(false);
                  }}
                >
                  <ThemedText style={styles.categoryOptionText}>{item.label}</ThemedText>
                  {form.category === item.value && <Ionicons name="checkmark" size={20} color="#F8B400" />}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeModalBtn}
              onPress={() => setIsModalVisible(false)}
            >
              <ThemedText style={{ color: '#FF4D4D', fontWeight: 'bold' }}>Hủy bỏ</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  form: { padding: 20 },
  label: { fontWeight: '600', marginBottom: 5, marginTop: 15 },
  input: { backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12, fontSize: 16 },

  // Style cho Dropdown
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12
  },

  // Style cho Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '50%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  categoryOption: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomWidth: 0.5, borderBottomColor: '#EEE' },
  categoryOptionText: { fontSize: 16 },
  closeModalBtn: { marginTop: 20, alignItems: 'center', paddingBottom: 10 },

  submitBtn: { backgroundColor: '#F8B400', padding: 15, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});