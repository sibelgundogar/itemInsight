import React from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { firebaseAuth } from '../firebase';

const Stack = createStackNavigator();

// profil ve ürün detayı sayfaları için navigator
export default function Profile() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profil" component={ProfileScreen} options={{ headerShown: true, headerBackVisible: false, }} />
      <Stack.Screen name="Ürün Detayı" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileScreen({ navigation }) {
  // Yüklediğim ilanlar kısmı için örnek ürünler
  const products = [
    {
      id: 1,
      name: 'Cüzdan',
      location: 'Altıeylül, Balıkesir',
      image: require('../images/cuzdan.jpg'),
      desc: 'Siyah deri bir cüzdan. İçinde kimilk veya kredi kartı yok, NEF civarında bulunmuştur.',
    },
    {
      id: 2,
      name: 'Kolye',
      location: 'Karesi, Balıkesir',
      image: require('../images/kolye.jpg'),
      desc: 'Altın rengi kolye. Karesi Belediye Binasında bulunmuştur. Sahibi mesaj atarak ulaşabilir.',
    },
  ];

  // ürünleri render etmek için
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItemContainer}
      onPress={() => navigation.navigate('Ürün Detayı', { product: item })}>
      <View style={styles.productItem}>
        <Image source={item.image} style={styles.productImage} resizeMode="cover" />
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profilim</Text>
      <Text style={styles.hiText}>Merhaba, gundogarsibel</Text>
      <TouchableOpacity style={styles.exitContainer} onPress={() => firebaseAuth.signOut()}>
        <Text style={styles.exitText}>Çıkış yap</Text>
        <TouchableOpacity style={styles.exitButton} onPress={() => firebaseAuth.signOut()}>
          <FontAwesome name="sign-out" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>

      <Text style={styles.header}>Yüklediğim İlanlar</Text>
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
        />
    </View>
  );
}

// Ürün detay sayfası
function ProductDetailScreen({ route }) {
  const { product } = route.params;
  return (
    <View style={styles.container}>
      <Image source={product.image} style={styles.productDetailImage} resizeMode="cover" />
      <Text style={styles.productDetailName}>{product.name}</Text>
      <Text style={styles.productDetailLocation}>{product.location}</Text>
      <Text style={styles.productDetailDesc}>{product.desc}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="check" size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="edit" size={24} color="yellow" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  productItemContainer: {
    flex: 1,
    margin: 5,
  },
  productItem: {
    width: 170,
    borderColor: '#B97AFF',
    borderWidth: 2,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
    padding: 10,
  },
  productImage: {
    width: '95%',
    height: 120,
    borderRadius: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  productLocation: {
    fontSize: 14,
    color: '#6700A9',
    marginTop: 5,
  },
  productDetailImage: {
    width: 350,
    height: 250,
    borderRadius: 5,
    alignSelf: 'center',
    marginBottom: 15,
  },
  productDetailName: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  productDetailLocation: {
    marginLeft: 20,
    fontSize: 15,
    color: '#6700A9',
    marginTop: 5,
  },
  productDetailDesc: {
    marginLeft: 20,
    fontSize: 15,
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 50,
    marginLeft: 150,
    marginRight: 20,
  },
  iconButton: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  exitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    marginLeft: 250,
    marginRight: 10,
    marginBottom: 50,
  },
  exitText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'red',
  },
  exitButton: {
    backgroundColor: 'none',
    flex: 1,
    alignItems: 'center',
  },
  hiText: {
    fontSize: 20,
  },
});

