import { useLocalSearchParams, useRouter, router } from 'expo-router';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FOOD_ITEMS } from '../(tabs)/index';
import { addToCart } from '../cart-store';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const item = FOOD_ITEMS.find((f) => f.id === id);

  // Hàm xử lý khi nhấn nút
  const handleAdd = () => {
    if (item) {
      addToCart(item); // Thêm vào store
      
      // Hiển thị thông báo Alert ngay lập tức
      Alert.alert(
        "Thành công",
        `Đã thêm món ${item.name} vào giỏ hàng!`,
        [{ text: "Đóng", style: "cancel" }]
      );
    }
  };

  if (!item) return null;
    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <ThemedView style={styles.content}>
                <ThemedText type="title" style={{ color: '#d78f31' }}>{item.name}</ThemedText>
                <ThemedText style={styles.price}>{item.price}</ThemedText>

                <ThemedView style={styles.divider} />

                <ThemedText type="subtitle" style={{ color: '#c55858' }}>Mô tả sản phẩm</ThemedText>
                <ThemedText style={styles.description}>{item.desc}</ThemedText>

                <TouchableOpacity 
                    style={styles.button} 
                    onPress={handleAdd} 
                >
                
                    <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>
                        THÊM VÀO GIỎ HÀNG
                    </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ThemedText>Quay lại</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    image: { width: '100%', height: 300 },
    content: { padding: 20, borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -30, backgroundColor: '#fff' },
    price: { fontSize: 24, fontWeight: 'bold', color: '#FF4D4D', marginVertical: 10 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    description: { lineHeight: 22, color: '#140b0b' },
    button: { backgroundColor: '#F8B400', padding: 15, borderRadius: 15, marginTop: 30, alignItems: 'center' },
    buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    backButton: { marginTop: 20, alignItems: 'center' }
});