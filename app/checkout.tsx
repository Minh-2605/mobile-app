import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { clearCart, globalCart } from "./cart-store";

export default function CheckoutScreen() {
  const { total } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [showQR, setShowQR] = useState(false);

  const [shippingMethod, setShippingMethod] = useState<"normal" | "fast">("normal");

  const shippingFee = shippingMethod === "normal" ? 10000 : 30000;
  const finalTotal = Number(total) + shippingFee;

  // Cấu hình VietQR
  const BANK_ID = "MB";
  const ACCOUNT_NO = "0123456789";
  const ACCOUNT_NAME = "NGUYEN VAN A";
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${finalTotal}&addInfo=THANHTOAN_${phone}&accountName=${ACCOUNT_NAME}`;

  const handleConfirmOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setShowQR(true);
  };

  const handleFinishAll = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      const response = await fetch("http://192.168.100.220:5000/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_name: name,
          phone: phone,
          address: address,
          total_price: finalTotal,
          items: globalCart,
          email: userEmail,
          payment_status: "pending",
        }),
      });

      if (response.ok) {
        clearCart();
        setShowQR(false);
        Alert.alert("Thành công", "Đơn hàng và yêu cầu thanh toán đã được gửi!");
        router.replace("/");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể gửi đơn hàng. Kiểm tra server!");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.form}>
        <ThemedText type="title" style={styles.title}>
          Thông tin giao hàng
        </ThemedText>

        <ThemedText style={styles.label}>Tên người nhận</ThemedText>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nguyễn Văn A"
        />

        <ThemedText style={styles.label}>Số điện thoại</ThemedText>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="090xxxxxxx"
          keyboardType="phone-pad"
        />

        <ThemedText style={styles.label}>Địa chỉ nhận hàng</ThemedText>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={address}
          onChangeText={setAddress}
          placeholder="Số nhà, tên đường..."
          multiline
        />

        <TouchableOpacity style={styles.btn} onPress={handleConfirmOrder}>
          <ThemedText style={styles.btnText}>THANH TOÁN & ĐẶT HÀNG</ThemedText>
        </TouchableOpacity>

        <Modal visible={showQR} animationType="slide" transparent={false}>
          <View style={styles.qrContainer}>
            <TouchableOpacity style={styles.closeModal} onPress={() => setShowQR(false)}>
              <Ionicons name="close" size={30} color="black" />
            </TouchableOpacity>

            <ThemedText style={styles.qrTitle}>Quét mã VietQR</ThemedText>
            <Image source={{ uri: qrUrl }} style={styles.qrImage} />

            <View style={styles.qrInfo}>
              <ThemedText>
                Số tiền:{" "}
                <ThemedText style={{ fontWeight: "bold" }}>
                  {finalTotal.toLocaleString()}đ
                </ThemedText>
              </ThemedText>
              <ThemedText>
                Nội dung:{" "}
                <ThemedText style={{ fontWeight: "bold" }}>
                  THANHTOAN_{phone}
                </ThemedText>
              </ThemedText>
            </View>

            <TouchableOpacity style={styles.confirmBtn} onPress={handleFinishAll}>
              <ThemedText style={styles.confirmBtnText}>
                TÔI ĐÃ CHUYỂN KHOẢN XONG
              </ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.note}>
              Admin sẽ kiểm tra và duyệt đơn ngay khi nhận được tiền.
            </ThemedText>
          </View>
        </Modal>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  form: { padding: 20, paddingTop: 40 },
  title: { marginBottom: 30, color: "#F8B400", fontWeight: "bold" },
  label: { marginBottom: 8, fontWeight: "600", fontSize: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    backgroundColor: "#F9FAFB",
    fontSize: 16,
  },
  btn: {
    backgroundColor: "#F8B400",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#F8B400",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // Styles cho QR Modal
  qrContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  closeModal: { position: "absolute", top: 50, right: 20 },
  qrTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#F8B400",
  },
  qrImage: { width: 300, height: 300, borderRadius: 15 },
  qrInfo: {
    marginVertical: 20,
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 15,
    width: "100%",
    borderWidth: 1,
    borderColor: "#eee"
  },
  confirmBtn: {
    backgroundColor: "#F8B400",
    padding: 18,
    borderRadius: 15,
    width: "100%",
    alignItems: "center",
  },
  confirmBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  note: { marginTop: 15, color: "#888", textAlign: "center", fontSize: 13, lineHeight: 18 },
});