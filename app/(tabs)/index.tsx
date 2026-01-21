import { Image } from 'expo-image';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, View, ActivityIndicator, Platform } from 'react-native';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link, Redirect, useRouter } from 'expo-router'; // Thêm useRouter
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // BẮT BUỘC PHẢI THÊM DÒNG NÀY

const API_URL = "http://192.168.5.1:5000/products";

const CATEGORIES = [
  { id: 'all', name: 'Tất cả', icon: '🍽️' },
  { id: 'burger', name: 'Burger', icon: '🍔' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'Gà rán', name: 'Gà rán', icon: '🍗' },
  { id: 'Khoai tây', name: 'Khoai tây', icon: '🍟' },
  { id: 'Đồ uống', name: 'Đồ uống', icon: '🥤' },
  { id: 'Mì Ý', name: 'Mì Ý', icon: '🍝' },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allFoods, setAllFoods] = useState<any[]>([]);
  const [filteredFoods, setFilteredFoods] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const initializeData = async () => {
      // 1. Kiểm tra login trước
      const email = await AsyncStorage.getItem('userEmail');
      const loggedIn = !!email;
      setIsLoggedIn(loggedIn);

      // 2. Nếu đã login thì mới lấy sản phẩm
      if (loggedIn) {
        await fetchProducts();
      }
    };
    
    initializeData();
    const getRole = async () => {
    const storedRole = await AsyncStorage.getItem('userRole');
    setRole(storedRole);
  };
  getRole();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      const data = await response.json();
      setAllFoods(data);
      setFilteredFoods(data);
    } catch (error) {
      console.error("Lỗi Fetch Products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Trả về loading khi đang kiểm tra AsyncStorage
  if (isLoggedIn === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#F8B400" />
      </View>
    );
  }

  // Chuyển hướng nếu chưa đăng nhập
  if (isLoggedIn === false) {
    return <Redirect href="/login" />;
  }

  // --- Giữ nguyên các hàm handleFilter và phần return giao diện của bạn bên dưới ---
  const removeVietnameseTones = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().trim();
  };

  const handleFilter = (value: string, isCategory: boolean = false) => {
    if (isCategory) {
      setActiveTab(value);
      setSearchQuery('');
      if (value === 'all') {
        setFilteredFoods(allFoods);
      } else {
        const filtered = allFoods.filter(item => item.category?.toLowerCase() === value.toLowerCase());
        setFilteredFoods(filtered);
      }
    } else {
      setSearchQuery(value);
      setActiveTab('all');
      const searchKeyword = removeVietnameseTones(value);
      const filtered = allFoods.filter((item) => {
        const nameNoTone = removeVietnameseTones(item.name || "");
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
          contentFit="cover"
        />
      }>
      {/* ... Phần nội dung ThemedView của bạn giữ nguyên ... */}
      <ThemedView style={styles.titleContainer}>
        <View>
          <ThemedText type="title" style={styles.welcomeText}>Hello Foodie!</ThemedText>
          <ThemedText style={styles.subWelcome}>Hôm nay bạn muốn ăn gì?</ThemedText>
        </View>
        <HelloWave />
      </ThemedView>
      {role === 'admin' && (
  <TouchableOpacity 
    style={styles.adminBadge} 
    onPress={() => router.push("/admin/" as any)} // Chỉ định rõ file index
  >
    <Ionicons name="shield-checkmark" size={16} color="white" />
    <ThemedText style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}> TRANG QUẢN TRỊ</ThemedText>
  </TouchableOpacity>
)}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Tìm món ăn ngon ngay..."
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(text) => handleFilter(text, false)}
        />
      </View>

      {/* ... Danh mục và List món ăn giữ nguyên ... */}
      <View style={styles.sectionContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Danh mục</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryItem, activeTab === cat.id && styles.categoryItemActive]}
              onPress={() => handleFilter(cat.id, true)}
            >
              <ThemedText style={[styles.categoryText, activeTab === cat.id && styles.categoryTextActive]}>
                {cat.icon} {cat.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ThemedView style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            {activeTab !== 'all' ? CATEGORIES.find(c => c.id === activeTab)?.name : "Món ăn phổ biến 🔥"}
          </ThemedText>
          <ThemedText style={styles.itemCount}>{filteredFoods.length} món</ThemedText>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#F8B400" style={{ marginTop: 20 }} />
        ) : (
          filteredFoods.map((item) => (
            <Link key={item.id} href={`/product/${item.id}`} asChild>
              <TouchableOpacity style={styles.foodCard} activeOpacity={0.8}>
                <Image source={{ uri: item.image }} style={styles.foodImage} transition={300} />
                <View style={styles.foodInfo}>
                  <View style={styles.tagCategory}>
                    <ThemedText style={styles.tagText}>{item.category?.toUpperCase()}</ThemedText>
                  </View>
                  <ThemedText style={styles.foodName} numberOfLines={1}>{item.name}</ThemedText>
                  <ThemedText style={styles.priceText}>
                    {typeof item.price === 'number' ? `${item.price.toLocaleString('vi-VN')}đ` : item.price}
                  </ThemedText>
                  <ThemedText numberOfLines={1} style={styles.descText}>
                    {item.description || "Hương vị thơm ngon khó cưỡng..."}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </Link>
          ))
        )}

        {!loading && filteredFoods.length === 0 && (
          <View style={styles.noResultBox}>
            <Ionicons name="fast-food-outline" size={60} color="#DDD" />
            <ThemedText style={styles.noResultText}>Rất tiếc, không tìm thấy món này 😢</ThemedText>
          </View>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

// ... Giữ nguyên phần styles của bạn bên dưới ...

const styles = StyleSheet.create({
  headerBanner: { height: '100%', width: '100%' },
  titleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5, marginTop: 10 },
  welcomeText: { fontSize: 28, fontWeight: '800' },
  subWelcome: { color: '#666', fontSize: 16 },
  
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#F3F4F6', 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    marginVertical: 15,
    height: 50
  },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: '#333' },

  sectionContainer: { marginTop: 15 },
  sectionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 5 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  itemCount: { color: '#F8B400', fontWeight: '600' },

  categoryList: { gap: 10, paddingVertical: 5 },
  categoryItem: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#EEE' },
  categoryItemActive: { backgroundColor: '#F8B400', borderColor: '#F8B400' },
  categoryText: { color: '#555', fontSize: 14, fontWeight: '500' },
  categoryTextActive: { color: '#fff', fontWeight: 'bold' },

  foodCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 10, 
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
    position: 'relative'
  },
  foodImage: { width: 100, height: 100, borderRadius: 15 },
  foodInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  foodName: { fontSize: 17, fontWeight: '700', color: '#1A1A1A' },
  tagCategory: { backgroundColor: '#FFF9E5', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 5 },
  tagText: { fontSize: 10, color: '#F8B400', fontWeight: 'bold' },
  priceText: { color: '#FF4D4D', fontWeight: '800', fontSize: 18, marginVertical: 2 },
  descText: { fontSize: 13, color: '#888', fontStyle: 'italic' },
  


  noResultBox: { alignItems: 'center', marginTop: 40, gap: 10 },
  noResultText: { color: '#999', fontSize: 16 },

  adminBadge: {
  backgroundColor: '#FF4D4D',
  flexDirection: 'row',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 20,
  alignSelf: 'flex-start',
  marginTop: 10,
  alignItems: 'center'
},
});