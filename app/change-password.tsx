import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view'; // 
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChangePassword() {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const email = "phananhminhzxy@gmail.com";

  const handleChange = async () => {
    if (!oldPass || !newPass || !confirmPass) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert("Lỗi", "Mật khẩu mới không trùng khớp");
      return;
    }

    try {
      const res = await fetch("http://192.168.100.220:5000/change-password", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, oldPassword: oldPass, newPassword: newPass })
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("Thành công", "Mật khẩu đã được cập nhật!");
        router.back()
      } else {
        Alert.alert("Thất bại", data.message);
      }
    } catch (e) {
      Alert.alert("Lỗi", "Không kết nối được server");
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Nút quay lại */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <IconSymbol name="chevron.left" size={24} color="#333" />
      </TouchableOpacity>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <IconSymbol name="lock.fill" size={40} color="#F8B400" />
          </View>
          <ThemedText type="title" style={styles.title}>Đổi mật khẩu</ThemedText>
          <ThemedText style={styles.subtitle}>Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để bảo mật tài khoản</ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <IconSymbol name="key.fill" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              placeholder="Mật khẩu hiện tại"
              secureTextEntry
              style={styles.input}
              onChangeText={setOldPass}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <IconSymbol name="lock.shield.fill" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              placeholder="Mật khẩu mới"
              secureTextEntry
              style={styles.input}
              onChangeText={setNewPass}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputContainer}>
            <IconSymbol name="checkmark.shield.fill" size={20} color="#999" style={styles.inputIcon} />
            <TextInput
              placeholder="Xác nhận mật khẩu mới"
              secureTextEntry
              style={styles.input}
              onChangeText={setConfirmPass}
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity onPress={handleChange} style={styles.btn} activeOpacity={0.8}>
            <ThemedText style={styles.btnText}>CẬP NHẬT MẬT KHẨU</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, padding: 25, justifyContent: 'center' },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  subtitle: { textAlign: 'center', color: '#777', lineHeight: 20, paddingHorizontal: 20 },
  form: { width: '100%' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: '#333' },
  btn: {
    backgroundColor: '#F8B400',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#F8B400',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});