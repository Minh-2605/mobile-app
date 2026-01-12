import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FOOD_ITEMS } from '../(tabs)/index'; // Import data từ trang chủ

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Tìm món ăn dựa trên ID
    const item = FOOD_ITEMS.find((f) => f.id === id);

    if (!item) return <ThemedText>Không tìm thấy sản phẩm</ThemedText>;

    return (
        <ScrollView style={styles.container}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <ThemedView style={styles.content}>
                <ThemedText type="title" style={{ color: '#d78f31' }}>{item.name}</ThemedText>
                <ThemedText style={styles.price}>{item.price}</ThemedText>

                <ThemedView style={styles.divider} />

                <ThemedText type="subtitle" style={{ color: '#c55858' }}>Mô tả sản phẩm</ThemedText>
                <ThemedText style={styles.description}>{item.desc}</ThemedText>

                <TouchableOpacity style={styles.button} onPress={() => alert('Đã thêm vào giỏ hàng!')}>
                    <ThemedText style={styles.buttonText}>Thêm vào giỏ hàng</ThemedText>
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