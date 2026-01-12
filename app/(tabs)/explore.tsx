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
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      console.log("Email lấy được từ máy:", email); // Xem Terminal có dòng này không
      setUserEmail(email);
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    // 1. Kiểm tra xem hàm có chạy vào đây không
    console.log("ĐANG THỰC HIỆN LOGOUT...");

    // 2. Xóa sạch bộ nhớ
    await AsyncStorage.clear();

    // 3. Thông báo đơn giản (Bỏ qua Alert.alert phức tạp)
    alert("Đã đăng xuất thành công!");

    // 4. Chuyển trang ngay lập tức
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <IconSymbol
            size={310}
            color="#808080"
            name="person.fill"
            style={styles.headerImage}
          />
        }>

        {/* Nội dung bao bọc trong một View chính */}

        <View style={styles.mainContainer}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">Trang Cá Nhân</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoSection}>
            <ThemedText type="defaultSemiBold">Email:</ThemedText>
            <ThemedText style={styles.emailValue}>{userEmail || "N/A"}</ThemedText>
          </ThemedView>
        </View>

      </ParallaxScrollView>

      {/* Đưa nút lên vị trí cao hơn một chút để tránh bị thanh Tab che */}
      <View style={{ position: 'absolute', bottom: 120, left: 30, right: 30, zIndex: 1000 }}>
        <TouchableOpacity
          style={[styles.logoutBtn, { elevation: 10, shadowOpacity: 0.5 }]} // Thêm độ nổi cho Android/iOS
          onPress={handleLogout}
        >
          <ThemedText style={styles.logoutText}>ĐĂNG XUẤT NGAY</ThemedText>
        </TouchableOpacity>
      </View>
    </View >
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  mainContainer: {
    paddingBottom: 50,
    flex: 1,           // THÊM DÒNG NÀY: Ép container chiếm toàn bộ không gian
    minHeight: 300, // Tạo khoảng trống để không bị che bởi thanh Tab
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  infoSection: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5', // Đảm bảo dùng backgroundColor, không dùng color
    marginBottom: 20,
  },
  emailValue: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 999, // Đảm bảo nút nằm trên cùng
    marginTop: 20,
    position: 'relative', // Đảm bảo nó tuân thủ luồng hiển thị

  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
});