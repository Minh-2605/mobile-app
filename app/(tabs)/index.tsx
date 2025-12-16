import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function HomeScreen() {
  const foods = [
    {
      id: '1',
      name: 'Burger bò',
      price: '35.000đ',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349',
    },
    {
      id: '2',
      name: 'Gà rán',
      price: '45.000đ',
      image: 'https://images.unsplash.com/photo-1562967916-eb82221dfb36',
    },
    {
      id: '3',
      name: 'Pizza mini',
      price: '60.000đ',
      image: 'https://images.unsplash.com/photo-1548365328-9f547fb0953b',
    },
    {
      id: '4',
      name: 'Khoai tây chiên',
      price: '25.000đ',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🍔 FastFood App</Text>
      <Text style={styles.subtitle}>Món ngon – Giao nhanh</Text>

      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092' }}
        style={styles.banner}
      />

      <Text style={styles.section}>Món bán chạy</Text>

      <View style={styles.list}>
        {foods.map(item => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.image }} style={styles.foodImage} />
            <Text style={styles.foodName}>{item.name}</Text>
            <Text style={styles.price}>{item.price}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e11d48',
  },
  subtitle: {
    color: '#6b7280',
    marginBottom: 12,
  },
  banner: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    marginBottom: 20,
  },
  section: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
  },
  foodImage: {
    width: '100%',
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  foodName: {
    fontWeight: '600',
  },
  price: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
});
