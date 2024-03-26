import React from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

import Messages from './Messages';
import New from './New';
import Profile from './Profile';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export default function Home() {
  return (
    <Navbar />
  );
}

// Her  sayfanın altındaki navigation barın sekmeleri
function Navbar() {
  return (
    <Tab.Navigator
      initialRouteName="HomeParent" //varsayılan olarak açılacak sayfa
      screenOptions={{
        tabBarActiveTintColor: '#B97AFF',
      }}>
      <Tab.Screen
        name="HomeParent"
        component={HomeWrapper}
        options={{
          headerShown: false,
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="MessagesParent"
        component={Messages}
        options={{
          headerBackVisible: false,
          headerShown: false,
          tabBarLabel: 'Mesajlar',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="message" color={color} size={25} />
          ),
        }}
      />
      <Tab.Screen
        name="Yeni"
        component={New}
        options={{
          tabBarLabel: 'Yeni',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="plus" color={color} size={30} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          headerBackVisible: false,
          headerShown: false,
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={30} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

//ana sayfanın kodları
function HomeScreen({ navigation }) {
  // Ana sayfanın içeriğinde görünmesi için bir kaç örnek ürün ilanı
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
    {
      id: 3,
      name: 'Saat',
      location: 'Eyüp, İstanbul',
      image: require('../images/saat.jpg'),
      desc: 'Saat sahibi saatiyle olan bi fotoğrafı göstererek teslim alabilir. Mesaj atın.',
    },
    {
      id: 4,
      name: 'Plaka',
      location: 'Esenler, İstanbul',
      image: require('../images/plaka.jpg'),
      desc: ' nolu plakayı Esenler meydanda araç sahibi düşürmüş. Mesaj atarak ulaşabilirsiniz. ',
    },
    {
      id: 5,
      name: 'Kulaklık',
      location: 'Urla, İzmir',
      image: require('../images/kulaklik.jpg'),
      desc: 'Urla da bir kafede bulundu. Kafeden teslim alabilirsiniz, sahibinin telefonuna otomatik bağlanırsa sahibine teslim edilecektir.',
    },
  ];

  // Her bir ürünü render ediyor
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.productItemContainer} onPress={() => navigation.navigate('Ürün Detayı', { product: item })}>
      <View style={styles.productItem}>
        <Image source={item.image} style={styles.productImage} resizeMode="cover" />
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productLocation}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  // Ana sayfanın tasarımı search bar ve ürünlerin flat listi return ediliyor
  return (
    <View style={styles.container}>
      <SearchBar style={styles.searchbar} placeholder="Bul..." lightTheme />
        <FlatList data={products} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} numColumns={2} />
    </View>
  );
}

// Ürün detayı sayfası açılca geleek ekranın tasarımını içeren fonksiyon
function ProductDetailScreen({ route }) {
  const { product } = route.params;
  return (
    <View style={styles.container}>
      <Image source={product.image} style={styles.productDetailImage} resizeMode="cover" />
      <Text style={styles.productDetailName}>{product.name}</Text>
      <Text style={styles.productDetailLocation}>{product.location}</Text>
      <Text style={styles.productDetailDesc}>{product.desc}</Text>
      <TouchableOpacity style={styles.sendButton}>
        <Text style={styles.sendButtonText}>Mesaj Gönder</Text>
      </TouchableOpacity>
    </View>
  );
}

//Ana sayfa ve Ürün detay sayfası arasında stack screen oluşturan fonksiyon
function HomeWrapper() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Ürün Detayı" component={ProductDetailScreen} />
    </Stack.Navigator>
  )
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 20,
  },
  searchbar: {
    borderRadius: 4,
    width: '100%',
    backgroundColor: '#bdc6cf',
  },
  productItemContainer: {
    flex: 1,
    margin: 5,
  },
  productItem: {
    flex: 1,
    alignItems: 'center',
    width: 170,
    borderColor: '#B97AFF',
    borderWidth: 2,
    borderRadius: 15,
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
    alignSelf: 'center',
    width: 350,
    height: 250,
    borderRadius: 5,
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
  sendButton: {
    marginTop: 50,
    backgroundColor: '#B97AFF',
    padding: 10,
    borderRadius: 5,
    marginLeft: 250,
    marginRight: 10,
  },
  sendButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});


