import { Image } from 'expo-image';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, View, ActivityIndicator } from 'react-native';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';

// Cấu hình địa chỉ IP máy tính của bạn (Thay đổi XX bằng IP thật)
const API_URL = "http://192.168.5.1:5000/products"; 


const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: '🍽️' },
  { id: 'burger', name: 'Burger', icon: '🍔' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'chicken', name: 'Gà rán', icon: '🍗' },
  { id: 'drink', name: 'Đồ uống', icon: '🥤' },
  { id: 'pasta', name: 'Mì Ý', icon: '🍝' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allFoods, setAllFoods] = useState<any[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Tất cả');
  const [loading, setLoading] = useState(true); 

  // 1. Gọi API khi component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    console.log("Dữ liệu nhận được:", data); // Kiểm tra xem có thấy mảng sp không
    setAllFoods(data);
    setFilteredFoods(data);
  } catch (error) {
    console.error("Lỗi Fetch:", error); // Nếu lỗi IP sẽ báo ở đây
  } finally {
    setLoading(false);
  }
};

  const removeVietnameseTones = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .toLowerCase()
      .trim();
  };

  // 2. Cập nhật hàm lọc sử dụng dữ liệu từ API
  const handleFilter = (text: string, isCategory: boolean = false) => {
    if (isCategory) {
      setActiveTab(text);
      setSearchQuery('');
      if (text === 'Tất cả') {
        setFilteredFoods(allFoods);
      } else {
        const filtered = allFoods.filter(item => item.category === text);
        setFilteredFoods(filtered);
      }
    } else {
      setSearchQuery(text);
      setActiveTab('Tất cả');
      const searchKeyword = removeVietnameseTones(text);
      const filtered = allFoods.filter((item) => {
        const nameNoTone = removeVietnameseTones(item.name);
        return nameNoTone.includes(searchKeyword);
      });
      setFilteredFoods(filtered);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F8B400', dark: '#2D2D2D' }}
      headerImage={
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000' }}
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

      <ThemedView style={styles.searchContainer}>
        <TextInput
          placeholder="Tìm món ăn ngon ngay..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => handleFilter(text, false)}
        />
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Danh mục</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryItem, activeTab === cat.name && styles.categoryItemActive]}
              onPress={() => handleFilter(cat.name, true)}
            >
              <ThemedText style={[styles.categoryText, activeTab === cat.name && styles.categoryTextActive]}>
                {cat.icon} {cat.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      <ThemedView style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
           <ThemedText type="subtitle">
             {activeTab !== 'Tất cả' ? activeTab : "Món ăn phổ biến 🔥"}
           </ThemedText>
           <ThemedText style={{color: '#888'}}>{filteredFoods.length} món</ThemedText>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#F8B400" />
        ) : (
          filteredFoods.map((item) => (
            <Link key={item.id} href={`/product/${item.id}`} asChild>
              <TouchableOpacity style={styles.foodCard}>
                <Image source={{ uri: item.image }} style={styles.foodImage} />
                <ThemedView style={styles.foodInfo}>
                  <View style={styles.tagCategory}>
                     <ThemedText style={styles.tagText}>{item.category}</ThemedText>
                  </View>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  {/* Nếu DB lưu giá là số, hãy format lại. Ví dụ: 89000 -> 89.000đ */}
                  <ThemedText style={styles.priceText}>
                    {typeof item.price === 'number' ? `${item.price.toLocaleString()}đ` : item.price}
                  </ThemedText>
                  <ThemedText type="default" numberOfLines={1} style={styles.descText}>
                    {item.description || item.description}
                  </ThemedText>
                </ThemedView>
              </TouchableOpacity>
            </Link>
          ))
        )}
        
        {!loading && filteredFoods.length === 0 && (
          <ThemedText style={styles.noResultText}>Rất tiếc, không tìm thấy món này 😢</ThemedText>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

// ... Giữ nguyên styles bên dưới
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
  },
  
  categoryItemActive: { 
    backgroundColor: '#F8B400', 
    borderColor: '#F8B400' 
  },
  categoryText: { color: '#333', fontSize: 14 },
  categoryTextActive: { color: '#fff', fontWeight: 'bold' },
  
  // Tag danh mục trên card sản phẩm
  tagCategory: { 
    backgroundColor: '#F0F0F0', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 8, 
    paddingVertical: 2, 
    borderRadius: 4, 
    marginBottom: 4 
  },
  tagText: { fontSize: 10, color: '#888', fontWeight: 'bold' },
  
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 5 
  },
  
});