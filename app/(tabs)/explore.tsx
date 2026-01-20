import { StyleSheet, TouchableOpacity, Alert, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ParallaxScrollView from '../../components/parallax-scroll-view';
import { ThemedText } from '../../components/themed-text';
import { ThemedView } from '../../components/themed-view';
import { IconSymbol } from '../../components/ui/icon-symbol';

export default function ProfileScreen() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      setUserEmail(email);
    };
    loadData();
  }, []);

  const handleLogout = async () => {
  setShowModal(false); // Đóng bảng hỏi trước
  await AsyncStorage.clear();
  router.replace('/login');
};

  return (
  <View style={{ flex: 1, backgroundColor: '#F8F9FA' }}>
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#F8B400', dark: '#353636' }}
      // Thêm thuộc tính này nếu component hỗ trợ, hoặc bọc View nội dung
      headerImage={
        <IconSymbol
          size={250}
          color="rgba(255,255,255,0.4)"
          name="person.circle.fill"
          style={styles.headerImage}
        />
      }>

      {/* THAY ĐỔI TẠI ĐÂY: Thêm paddingBottom lớn để nút không bị sát đáy */}
      <View style={[styles.mainContainer, { paddingBottom: 100 }]}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title" style={styles.welcomeText}>Xin chào!</ThemedText>
          <ThemedText style={styles.subTitle}>Quản lý thông tin cá nhân của bạn</ThemedText>
        </ThemedView>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <IconSymbol name="envelope.fill" size={20} color="#666" />
            <ThemedText style={styles.label}>Email tài khoản</ThemedText>
          </View>
          <ThemedText style={styles.emailValue}>{userEmail || "Chưa cập nhật"}</ThemedText>
        </View>

        <View style={styles.menuContainer}>
           <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => router.push('/change-password')}
              activeOpacity={0.6}
          >
              <View style={styles.menuLeft}>
                  <IconSymbol name="lock.fill" size={20} color="#F8B400" />
                  <ThemedText style={styles.menuItemText}>Đổi mật khẩu</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={18} color="#CCC" />
          </TouchableOpacity>

          {/* NÚT ĐĂNG XUẤT: Thêm HitSlop để mở rộng vùng bấm */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={() => setShowModal(true)}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ThemedText style={styles.logoutText}>ĐĂNG XUẤT NGAY</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ParallaxScrollView>
    {showModal && (
        <View style={styles.overlay}>
          <View style={styles.modalBox}>
            <ThemedText style={styles.modalTitle}>Xác nhận</ThemedText>
            <ThemedText style={styles.modalSub}>Bạn có chắc chắn muốn đăng xuất?</ThemedText>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.mBtn, { backgroundColor: '#EEE' }]} 
                onPress={() => setShowModal(false)}
              >
                <ThemedText style={{ color: '#333' }}>Hủy</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.mBtn, { backgroundColor: '#FF4444' }]} 
                onPress={handleLogout}
              >
                <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Thoát</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
  </View>
);
}

const styles = StyleSheet.create({
  headerImage: {
    bottom: -50,
    alignSelf: 'center',
    position: 'absolute',
  },
  mainContainer: {
    padding: 20,
    // flex: 1,  <-- XÓA DÒNG NÀY
    minHeight: 500, // Thêm dòng này để ép khung nội dung luôn đủ lớn
  },
  titleContainer: {
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subTitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  infoSection: {
    padding: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  emailValue: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '700',
    marginLeft: 30,
  },
  menuContainer: {
    marginTop: 10,
  },
  menuItem: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4, // Tăng độ nổi để tránh bị chìm
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 110, // Giữ nguyên vị trí bạn muốn
    left: 20,
    right: 20,
    zIndex: 9999, // Đảm bảo luôn nằm trên cùng để ấn được
  },
  logoutBtn: {
    backgroundColor: '#ff4444',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20, // Tăng khoảng cách với nút trên
    elevation: 5, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10, // Ép nút nằm lên trên các thành phần khác
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Làm mờ nền sau
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000, // Đảm bảo nằm trên cùng của mọi thứ
  },
  modalBox: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  modalSub: { color: '#666', marginBottom: 20, textAlign: 'center' },
  modalButtons: { flexDirection: 'row', gap: 15 },
  mBtn: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center'
  }
});