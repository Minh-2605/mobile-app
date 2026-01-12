import { Image } from 'expo-image';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, View } from 'react-native';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';

// 1. Dữ liệu 6 món ăn
export const FOOD_ITEMS = [
  { id: '1', name: 'Double Cheese Burger', price: '89.000đ', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500', desc: 'Bò nướng vỉ thơm lừng, 2 lớp phô mai tan chảy kèm rau xà lách tươi.' },
  { id: '2', name: 'Pizza Hải Sản Size L', price: '159.000đ', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500', desc: 'Tôm, mực tươi ngon kết hợp với sốt pesto đặc biệt trên nền đế bánh giòn.' },
  { id: '3', name: 'Gà Rán Giòn Cay', price: '45.000đ', image: 'https://images.unsplash.com/photo-1562967914-608f82629710?q=80&w=500', desc: 'Gà tươi ướp gia vị cay nồng, chiên giòn rụm bên ngoài nhưng mềm mọng bên trong.' },
  { id: '4', name: 'Mì Ý Sốt Bò Bằm', price: '75.000đ', image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=500', desc: 'Sợi mì Ý dai ngon hòa quyện cùng sốt cà chua thịt bò bằm đậm đà.' },
  { id: '5', name: 'Trà Sữa Trân Châu', price: '40.000đ', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=500', desc: 'Trà sữa đậm vị trà, ngọt thanh cùng trân châu đen dai giòn sần sật.' },
];

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F8B400', dark: '#2D2D2D' }}
      headerImage={
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop' }}
          style={styles.headerBanner}
        />
      }>

      {/* Lời chào */}
      <ThemedView style={styles.titleContainer}>
        <View>
          <ThemedText type="title">Hello Foodie!</ThemedText>
          <ThemedText type="default">Hôm nay bạn muốn ăn gì?</ThemedText>
        </View>
        <HelloWave />
      </ThemedView>

      {/* Thanh tìm kiếm */}
      <ThemedView style={styles.searchContainer}>
        <TextInput
          placeholder="Tìm món ăn ngon ngay..."
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </ThemedView>

      {/* Danh mục */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Danh mục</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
          {['🍔 Burger', '🍕 Pizza', '🍗 Gà rán', '🍟 Khoai tây', '🥤 Đồ uống', '🍝 Mì Ý'].map((cat, index) => (
            <TouchableOpacity key={index} style={styles.categoryItem}>
              <ThemedText type="defaultSemiBold">{cat}</ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ThemedView>

      {/* Danh sách 6 món ăn */}
      <ThemedView style={styles.sectionContainer}>
        <ThemedText type="subtitle">Món ăn phổ biến 🔥</ThemedText>

        {FOOD_ITEMS.map((item) => (
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
        ))}
      </ThemedView>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerBanner: {
    height: '100%',
    width: '100%',
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  searchContainer: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginVertical: 10,
  },
  searchInput: {
    fontSize: 16,
    color: '#333',
  },
  sectionContainer: {
    gap: 12,
    marginTop: 20,
  },
  categoryList: {
    gap: 10,
    paddingVertical: 5,
  },
  categoryItem: {
    backgroundColor: '#FFEAA7',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#F8B400',
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Bóng đổ cho Android
  },
  foodImage: {
    width: 110,
    height: 110,
  },
  foodInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  priceText: {
    color: '#FF4D4D',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 4,
  },
  descText: {
    fontSize: 13,
    color: '#666',
  },
});