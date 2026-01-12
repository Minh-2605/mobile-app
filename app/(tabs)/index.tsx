import { Image } from 'expo-image';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, View, FlatList } from 'react-native';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';

// 1. Dữ liệu gốc
export const FOOD_ITEMS = [
  { id: '1', name: 'Double Cheese Burger', price: '89.000đ', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500', desc: 'Bò nướng vỉ thơm lừng, 2 lớp phô mai tan chảy kèm rau xà lách tươi.' },
  { id: '2', name: 'Pizza Hải Sản Size L', price: '159.000đ', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500', desc: 'Tôm, mực tươi ngon kết hợp với sốt pesto đặc biệt trên nền đế bánh giòn.' },
  { id: '3', name: 'Gà Rán Giòn Cay', price: '45.000đ', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=500', desc: 'Gà tươi ướp gia vị cay nồng, chiên giòn rụm bên ngoài nhưng mềm mọng bên trong.' },
  { id: '4', name: 'Mì Ý Sốt Bò Bằm', price: '75.000đ', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=500', desc: 'Sợi mì Ý dai ngon hòa quyện cùng sốt cà chua thịt bò bằm đậm đà.' },
  { id: '5', name: 'Trà Sữa Trân Châu', price: '40.000đ', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=500', desc: 'Trà sữa đậm vị trà, ngọt thanh cùng trân châu đen dai giòn sần sật.' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState(FOOD_ITEMS);

  // Hàm xử lý tìm kiếm
  // 1. Thêm hàm chuẩn hóa này ở ngoài Component HomeScreen
  const removeVietnameseTones = (str: string) => {
    return str
      .normalize('NFD')             // Tách các dấu ra khỏi chữ cái
      .replace(/[\u0300-\u036f]/g, '') // Xóa các ký tự dấu
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  };

  // 2. Trong hàm handleSearch của bạn
  const handleSearch = (text: string) => {
    setSearchQuery(text);

    if (text.trim() === '') {
      setFilteredFoods(FOOD_ITEMS); //
      return;
    }

    const searchKeyword = removeVietnameseTones(text);

    const filtered = FOOD_ITEMS.filter((item) => {
      const nameNoTone = removeVietnameseTones(item.name);
      return nameNoTone.includes(searchKeyword);
    });

    setFilteredFoods(filtered);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F8B400', dark: '#2D2D2D' }}
      headerImage={
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop' }}
          style={styles.headerBanner}
        />
      }>

      <ThemedView style={styles.titleContainer}>
        <View>
          <ThemedText type="title">Hello Foodie!</ThemedText>
          <ThemedText type="default">Hôm nay bạn muốn ăn gì?</ThemedText>
        </View>
        <HelloWave />
      </ThemedView>

      {/* Thanh tìm kiếm - Đã cập nhật logic */}
      <ThemedView style={styles.searchContainer}>
        <TextInput
          placeholder="Tìm món ăn ngon ngay..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch} // Gọi hàm lọc khi nhập chữ
        />
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Danh mục</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {['🍔 Burger', '🍕 Pizza', '🍗 Gà rán', '🍟 Khoai tây', '🥤 Đồ uống', '🍝 Mì Ý'].map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.categoryItem}
              onPress={() => handleSearch(cat.split(' ')[1])} // Tìm nhanh theo danh mục
            >
              <ThemedText type="defaultSemiBold">{cat}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">
          {searchQuery ? `Kết quả cho "${searchQuery}"` : "Món ăn phổ biến 🔥"}
        </ThemedText>

        {/* Hiển thị danh sách đã lọc */}
        {filteredFoods.length > 0 ? (
          filteredFoods.map((item) => (
            <Link key={item.id} href={`/product/${item.id}`} asChild>
              <TouchableOpacity style={styles.foodCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.foodImage}
                />
                <ThemedView style={styles.foodInfo}>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  <ThemedText style={styles.priceText}>{item.price}</ThemedText>
                  <ThemedText type="default" numberOfLines={1} style={styles.descText}>
                    {item.desc}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            </Link>
          ))
        ) : (
          <ThemedText style={styles.noResultText}>Rất tiếc, không tìm thấy món này 😢</ThemedText>
        )}
      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  // ... (Giữ nguyên các styles cũ của bạn)
  headerBanner: { height: '100%', width: '100%', position: 'absolute' },
  titleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 10 },
  searchContainer: { backgroundColor: '#F0F0F0', borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginVertical: 10 },
  searchInput: { fontSize: 16, color: '#333' },
  sectionContainer: { gap: 12, marginTop: 20 },
  categoryList: { gap: 10, paddingVertical: 5 },
  categoryItem: { backgroundColor: '#FFEAA7', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: '#F8B400' },
  foodCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 15, overflow: 'hidden', marginBottom: 15, elevation: 3 },
  foodImage: { width: 110, height: 110 },
  foodInfo: { flex: 1, padding: 12, justifyContent: 'center' },
  priceText: { color: '#FF4D4D', fontWeight: 'bold', fontSize: 18, marginVertical: 4 },
  descText: { fontSize: 13, color: '#666' },

  // Thêm style cho trường hợp không có kết quả
  noResultText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
    fontStyle: 'italic'
  }
});