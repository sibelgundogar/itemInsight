import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import cities from '../data/cities';

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
        name="New"
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
  const [items, setItems] = useState([]);
  const db = getFirestore();
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'items'));
        const itemsData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          itemsData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            city: data.city,
            district: data.district,
            photos: data.photos
          });
        });
        setItems(itemsData);
      } catch (error) {
        console.error('Verileri alırken bir hata oluştu:', error);
      }
    };
    fetchItems();
  }, []);

  // Her bir ürünü render ediyor
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemItemContainer} onPress={() => navigation.navigate('Ürün Detayı', { items: item })}>
      <View style={styles.itemItem}>
        <Image source={{ uri: item.photos[0] }} style={styles.itemImage} resizeMode="cover" />
        <Text style={styles.itemName}>{item.title}</Text>
        <Text style={styles.itemLocation}>{item.city}, {item.district}</Text>
      </View>
    </TouchableOpacity>
  );

  // Ana sayfanın tasarımı search bar ve ürünlerin flat listi return ediliyor
  return (
    <View style={styles.container}>
      <SearchBar style={styles.searchbar} placeholder="Bul..." lightTheme />
      <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} numColumns={2} />
    </View>
  );
}

// Ürün detayı sayfası açılca geleek ekranın tasarımını içeren fonksiyon
function ItemDetailScreen({ route }) {
  const { items } = route.params;
  const photos = items && items.photos ? items.photos : [];

  // Tüm resimleri göstermek için renderItem fonksiyonu güncelleniyor
  const renderItem = ({ item }) => (
    <Image source={{ uri: item }} style={styles.itemDetailImage} resizeMode="cover" />
  );
  

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={photos}
        keyExtractor={(photo, index) => index.toString()}
        renderItem={renderItem}
      />
      {/* <Image source={{ uri: items.photos[0] }} style={styles.itemImage} resizeMode="cover" /> */}
      <Text style={styles.itemDetailName}>{items.title}</Text>
      <Text style={styles.itemDetailLocation}>{items.city}, {items.district}</Text>
      <Text style={styles.itemDetailDesc}>{items.description}</Text>
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
      <Stack.Screen name="Ürün Detayı" component={ItemDetailScreen} />
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
  itemItemContainer: {
    flex: 1,
    margin: 5,
  },
  itemItem: {
    flex: 1,
    alignItems: 'center',
    width: 170,
    borderColor: '#B97AFF',
    borderWidth: 2,
    borderRadius: 15,
    padding: 10,
  },
  itemImage: {
    width: '95%',
    height: 120,
    borderRadius: 5,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  itemLocation: {
    fontSize: 14,
    color: '#6700A9',
    marginTop: 5,
  },
  itemDetailImage: {
    alignSelf: 'center',
    width: 350,
    height: 250,
    borderRadius: 5,
    marginBottom: 15,
  },
  itemDetailName: {
    marginLeft: 20,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  itemDetailLocation: {
    marginLeft: 20,
    fontSize: 15,
    color: '#6700A9',
    marginTop: 5,
  },
  itemDetailDesc: {
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