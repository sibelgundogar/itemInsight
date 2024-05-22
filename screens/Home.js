
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import SearchModal from '../components/SearchModal';

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
      initialRouteName="Main" //varsayılan olarak açılacak sayfa
      screenOptions={{
        tabBarActiveTintColor: '#B97AFF',
      }}>
      <Tab.Screen
        name="Main"
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

// Ana sayfanın kodları
function HomeScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false); // Yenileme durumunu izlemek için state
  const [searchText, setSearchText] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [searchDistrict, setSearchDistrict] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  const db = getFirestore();

  // Verilerin yenilenmesini sağlayacak işlev
const refreshItems = async () => {
  setRefreshing(true);
  try {
    const q = query(collection(db, 'items'), orderBy('timestamp', 'desc'));
    const querySnapshot = await getDocs(q);
    const itemsData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const titleMatches = data.title.toLowerCase().includes(searchText.toLowerCase());
      const descriptionMatches = data.description.toLowerCase().includes(searchText.toLowerCase());
      const cityMatches = searchCity ? data.city.toLowerCase().includes(searchCity.toLowerCase()) : true;
      if (!data.isComplete && titleMatches || descriptionMatches || cityMatches) {
        itemsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          city: data.city,
          district: data.district,
          photos: data.photos,
          timestamp: data.timestamp,
        });
      }
    });
    setItems(itemsData);
  } catch (error) {
    console.error('Verileri alırken bir hata oluştu:', error);
  } finally {
    setRefreshing(false);
  }
};


  useEffect(() => {
    refreshItems(); // Sayfa yüklendiğinde verileri ilk kez getir
  }, [searchText, searchCity, searchDistrict]);

  // Her bir ürünü render ediyor
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.itemItemContainer} onPress={() => navigation.navigate('Ürün Detayı', { items: item })}>
      <View style={styles.itemItem}>
        {item.photos && item.photos.length > 0 && <Image source={{ uri: item.photos[0] }} style={styles.itemImage} resizeMode="cover" />}
        <Text style={styles.itemName}>{item.title}</Text>
        <Text style={styles.itemLocation}>{item.city}, {item.district}</Text>
      </View>
    </TouchableOpacity>
  );

  const handleSearch = (text, city, district) => {
    setSearchText(text);
    setSearchCity(city);
    setSearchDistrict(district);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSearchCity('');
    setSearchDistrict('');
    refreshItems(); 
  };


  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.searchButton}>
          <MaterialCommunityIcons name="magnify" color="#B97AFF" size={25} />
          <Text style={styles.searchText}>Bul...</Text>
        </TouchableOpacity>
        {(searchText || searchCity || searchDistrict) && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <MaterialCommunityIcons name="close-circle" color="#B97AFF" size={25} />
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        refreshing={refreshing}
        onRefresh={refreshItems}
      />
      <SearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSearch={handleSearch}
      />
    </View>
  );
}

// Ürün detayı sayfası açılca geleek ekranın tasarımını içeren fonksiyon
function ItemDetailScreen({ route }) {
  const { items } = route.params;
  const photos = items && items.photos ? items.photos : [];
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(contentOffsetX / viewSize);
    setActiveIndex(index);
  };

  // // Tüm resimleri göstermek için renderItem fonksiyonu güncelleniyor
  // const renderItem = ({ item }) => (
  //   <Image source={{ uri: item }} style={styles.itemDetailImage} resizeMode="cover" />
  // );

  return (
    <View style={styles.photoContainer}>
      {/* <FlatList
        horizontal
        data={photos}
        keyExtractor={(photo, index) => index.toString()}
        renderItem={renderItem}
      /> */}
      <ScrollView
        horizontal
        pagingEnabled // Ekran boyutunda sayfa geçişi için pagingEnabled ekliyoruz
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {photos.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={{ ...styles.itemDetailImage }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <View style={styles.paginationContainer}>
        {photos.map((_, index) => (
          <View key={index} style={[styles.dot, { opacity: index === activeIndex ? 1 : 0.3 }]} />
        ))}
      </View>
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
    // flex: 1,
    padding: 10,
    marginTop: 20,
  },
  searchbar: {
    borderRadius: 4,
    width: '100%',
    backgroundColor: '#bdc6cf',
  },
  itemItemContainer: {
    // flex: 1,
    margin: 5,
  },
  itemItem: {
    // flex: 1,
    alignItems: 'center',
    width: 173,
    borderColor: '#B97AFF',
    borderWidth: 2,
    borderRadius: 15,
    padding: 10,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: 5
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
    width: 370,
    height: 370,
    borderRadius: 5,
    marginBottom: 15,
    marginHorizontal: 10
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
  photoContainer: {
    marginVertical: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#B97AFF',
    marginHorizontal: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B97AFF',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  searchText: {
    marginLeft: 10,
    color: '#888',
  },
  clearButton: {
    marginLeft: 10,
  },
});


