import { StyleSheet, FlatList, View, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Image } from 'expo-image';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { globalCart, incrementQuantity, decrementQuantity, removeFromCart, getTotalPrice } from '../cart-store';

export default function CartScreen() {
  const [items, setItems] = useState([...globalCart]);

  const refreshCart = () => {
    setItems([...globalCart]);
  };

  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [])
  );

  const handleRemove = (id: string) => {
    removeFromCart(id);
    refreshCart();
  };

  // Tính tổng tiền từ store
  const total = getTotalPrice();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.headerTitle}>Giỏ hàng</ThemedText>
      
      {items.length === 0 ? (
        <ThemedText style={styles.emptyText}>Giỏ hàng đang trống 😢</ThemedText>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                
                <View style={styles.itemInfo}>
                  <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                  <ThemedText style={styles.priceText}>{item.price}</ThemedText>
                  
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => { decrementQuantity(item.id); refreshCart(); }}
                    >
                      <ThemedText style={styles.qtyBtnText}>-</ThemedText>
                    </TouchableOpacity>
                    
                    <ThemedText style={styles.qtyValue}>{item.quantity}</ThemedText>
                    
                    <TouchableOpacity 
                      style={styles.qtyBtn} 
                      onPress={() => { incrementQuantity(item.id); refreshCart(); }}
                    >
                      <ThemedText style={styles.qtyBtnText}>+</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.deleteBtn} 
                  onPress={() => handleRemove(item.id)}
                >
                  <ThemedText style={styles.deleteBtnText}>Xóa</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Phần Tổng tiền và Thanh toán */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <ThemedText type="subtitle">Tổng cộng:</ThemedText>
              <ThemedText style={styles.totalPriceText}>
                {total.toLocaleString('vi-VN')}đ
              </ThemedText>
            </View>
            
            <TouchableOpacity 
              style={styles.checkoutBtn}
              onPress={() => Alert.alert("Thanh toán", "Cảm ơn bạn đã đặt hàng!")}
            >
              <ThemedText style={styles.checkoutText}>THANH TOÁN NGAY</ThemedText>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  headerTitle: { marginBottom: 20, color: '#F8B400' },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888' },
  cartItem: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 15, 
    padding: 10, 
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center'
  },
  itemImage: { width: 70, height: 70, borderRadius: 10 },
  itemInfo: { flex: 1, marginLeft: 12 },
  priceText: { color: '#FF4D4D', fontWeight: 'bold', fontSize: 14 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: { 
    backgroundColor: '#f0f0f0', 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  qtyBtnText: { fontSize: 18, fontWeight: 'bold' },
  qtyValue: { marginHorizontal: 15, fontSize: 16, fontWeight: 'bold' },
  deleteBtn: { padding: 8, marginLeft: 5 },
  deleteBtnText: { color: '#c72b2bff', fontSize: 12, textDecorationLine: 'underline' },
  
  // Styles mới cho footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 15,
    backgroundColor: 'transparent',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalPriceText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FF4D4D',
  },
  checkoutBtn: {
    backgroundColor: '#F8B400',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});