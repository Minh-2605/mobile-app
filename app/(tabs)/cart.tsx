import { StyleSheet, FlatList, View, TouchableOpacity, Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons'; // Thêm icon cho sinh động
import { globalCart, incrementQuantity, decrementQuantity, removeFromCart, getTotalPrice } from '../cart-store';

export default function CartScreen() {
  const [items, setItems] = useState<any[]>([]);

  const refreshCart = () => {
    setItems([...globalCart]);
  };

  useFocusEffect(
    useCallback(() => {
      setItems([...globalCart]);
    }, [])
  );

  const total = getTotalPrice();

  const handleGoToCheckout = () => {
    if (items.length === 0) {
      Alert.alert("Thông báo", "Giỏ hàng của bạn đang trống!");
      return;
    }
    router.push({
      pathname: '/checkout',
      params: { total: total }
    });
  };
  const handleRemove = (id: string) => {
  removeFromCart(id);
  refreshCart();
};

  return (
    <ThemedView style={styles.container}>
      {/* Header tinh tế hơn */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>Giỏ hàng của tôi</ThemedText>
        <ThemedText style={styles.itemCount}>{items.length} món</ThemedText>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={100} color="#DDD" />
          <ThemedText style={styles.emptyText}>Giỏ hàng đang trống 😢</ThemedText>
          <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push('/')}>
            <ThemedText style={styles.shopNowText}>Mua sắm ngay</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} contentFit="cover" transition={500} />

                <View style={styles.itemInfo}>
                  <ThemedText style={styles.itemName} numberOfLines={1}>{item.name}</ThemedText>
                  <ThemedText style={styles.priceText}>
                    {typeof item.price === 'number' ? `${item.price.toLocaleString('vi-VN')}đ` : item.price}
                  </ThemedText>

                  <View style={styles.quantityRow}>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => { decrementQuantity(item.id); refreshCart(); }}
                      >
                        <Ionicons name="remove" size={18} color="#555" />
                      </TouchableOpacity>
                      <ThemedText style={styles.qtyValue}>{item.quantity}</ThemedText>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => { incrementQuantity(item.id); refreshCart(); }}
                      >
                        <Ionicons name="add" size={18} color="#F8B400" />
                      </TouchableOpacity>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.trashBtn}
                      onPress={() => handleRemove(item.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="#FF4D4D" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />

          {/* Footer dạng Floating Card */}
          <View style={styles.footerCard}>
            <View style={styles.totalRow}>
              <View>
                <ThemedText style={styles.totalLabel}>Tổng tiền</ThemedText>
                <ThemedText style={styles.totalPriceText}>
                  {total.toLocaleString('vi-VN')}đ
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.checkoutBtn}
                onPress={handleGoToCheckout}
              >
                <ThemedText style={styles.checkoutText}>Thanh toán</ThemedText>
                <Ionicons name="chevron-forward" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1A1A1A' },
  itemCount: { color: '#888', fontWeight: '600' },
  
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  itemImage: { width: 90, height: 90, borderRadius: 15, backgroundColor: '#f5f5f5' },
  itemInfo: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  itemName: { fontSize: 17, fontWeight: '700', color: '#333' },
  priceText: { color: '#FF4D4D', fontWeight: '800', fontSize: 16 },
  
  quantityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4
  },
  qtyBtn: {
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 1
  },
  qtyValue: { marginHorizontal: 12, fontSize: 15, fontWeight: 'bold', color: '#333' },
  trashBtn: { padding: 8 },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  emptyText: { textAlign: 'center', marginTop: 10, fontSize: 18, color: '#999', fontWeight: '500' },
  shopNowBtn: { marginTop: 20, backgroundColor: '#F8B400', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
  shopNowText: { color: '#fff', fontWeight: 'bold' },

  footerCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingVertical: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 20
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: '#888', fontWeight: '600' },
  totalPriceText: { fontSize: 24, fontWeight: '900', color: '#1A1A1A' },
  checkoutBtn: {
    backgroundColor: '#F8B400',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});