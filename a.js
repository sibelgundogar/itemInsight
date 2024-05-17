// Profil fotoğrafını seçme işlemi
const selectProfileImage = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Kütüphane erişim izni reddedildi!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled && result.assets.length > 0) {
      const firstPhoto = result.assets[0];
      console.log('Seçilen fotoğraf URI:', firstPhoto.uri); // Ekledim: Seçilen fotoğrafın URI'sini konsola yazdır
      uploadProfileImage(firstPhoto.uri);
    } else {
      console.log('Fotoğraf seçilmedi veya seçim işlemi iptal edildi.');
    }
  } catch (error) {
    console.error('Profil resmi seçilirken bir hata oluştu:', error); // Ekledim: Hata durumunda konsola hata mesajını yazdır
    Alert.alert('Profil resmi seçilirken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

// Profil fotoğrafını Firebase Storage'a yükleme işlemi
const uploadProfileImage = async (uri) => {
  try {
    console.log('Profil fotoğrafı yükleme işlemi başlatıldı. Fotoğraf URI:', uri); // Ekledim: Yükleme işlemi başlatıldığında konsola yazdır
    setLoading(true); // Ekledim: Yükleme işlemi başladığında loading state'ini true yap
       const user = firebaseAuth.currentUser;
       const fileName = `profile_images/${user.uid}`;
       const storageRef = ref(storage, fileName);
    const contentType = 'image/jpeg'; // veya 'image/png' gibi uygun bir MIME türü
await uploadBytes(storageRef, { contentType });  // Değiştirildi: fetch işlemi kaldırıldı, uri doğrudan yükleme işlemine verildi
    const downloadURL = await getDownloadURL(storageRef);
    await updateProfile(user, { photoURL: downloadURL });
    setProfilePhoto(downloadURL);
    setLoading(false); // Ekledim: Yükleme işlemi tamamlandığında loading state'ini false yap
    console.log('Profil fotoğrafı başarıyla yüklendi. URL:', downloadURL); // Ekledim: Başarıyla yüklendiğinde konsola URL'yi yazdır
  } catch (error) {
    console.error('Profil resmi yüklenirken bir hata oluştu:', error); // Ekledim: Hata durumunda konsola hata mesajını yazdır
    setLoading(false); // Ekledim: Hata durumunda loading state'ini false yap
    Alert.alert('Hata', 'Profil resmi yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity,ScrollView } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

  const db = getFirestore();
  // Verilerin yenilenmesini sağlayacak işlev
  const refreshItems = async () => {
    setRefreshing(true); // Yenileme başladığında refreshing state'ini true olarak ayarla
    try {
      const querySnapshot = await getDocs(collection(db, 'items'));
      const itemsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!data.isComplete && data.title.toLowerCase().includes(searchText.toLowerCase())) { // Sadece isComplete değeri false olan ve arama metnini içeren ürünler ekleniyor
          itemsData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            city: data.city,
            district: data.district,
            photos: data.photos
          });
        }
      });
      setItems(itemsData);
    } catch (error) {
      console.error('Verileri alırken bir hata oluştu:', error);
    } finally {
      setRefreshing(false); // Yenileme tamamlandığında refreshing state'ini false olarak ayarla
    }
  };
  useEffect(() => {
    refreshItems(); // Sayfa yüklendiğinde verileri ilk kez getir
  }, [searchText]);

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

  // Ana sayfanın tasarımı search bar ve ürünlerin flat listi return ediliyor
  return (
    <View style={styles.container}>
      <SearchBar style={styles.searchbar} placeholder="Bul..." lightTheme onChangeText={(text) => setSearchText(text)} value={searchText} />
      <FlatList data={items} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} numColumns={2}
        refreshing={refreshing} // FlatList'in yenileme durumunu göstermesi için refreshing prop'unu ayarla
        onRefresh={refreshItems} // FlatList yenileme işlevini belirle
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
    const index = Math.round(contentOffsetX);
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
            style={{ ...styles.itemDetailImage}} 
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
    marginTop: -20, // Dots should appear above the images slightly
    marginBottom: 20,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#B97AFF',
    marginHorizontal: 5,
  },
});





import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { firebaseAuth } from '../firebase';
const Stack = createStackNavigator();

export default function Profile() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profil" component={ProfileScreen} options={{ headerShown: true, headerBackVisible: false }} />
      <Stack.Screen name="Ürün Detayı" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileScreen({ navigation }) {
  const [userProducts, setUserProducts] = useState([]);
  const [completedProducts, setCompletedProducts] = useState([]);
  const currentUser = firebaseAuth.currentUser;
  const [profilePhoto, setProfilePhoto] = useState(null); // Profil fotoğrafı state'i
  const [loading, setLoading] = useState(false); // Yükleme durumu
  const storage = getStorage();

  const fetchUserProducts = useCallback(async () => {
    try {
      const db = getFirestore();
      const q = query(collection(db, 'items'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const productsData = [];
      const completedProductsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.isComplete) {
          completedProductsData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            city: data.city,
            district: data.district,
            photos: data.photos,
            isComplete: data.isComplete
          });
        } else {
          productsData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            city: data.city,
            district: data.district,
            photos: data.photos,
            isComplete: data.isComplete
          });
        }
      });
      setUserProducts(productsData);
      setCompletedProducts(completedProductsData);
    } catch (error) {
      console.error('Kullanıcı ürünlerini alırken bir hata oluştu:', error);
    }
  }, [currentUser.uid]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserProducts();
    });

    return unsubscribe;
  }, [navigation, fetchUserProducts]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItemContainer}
      onPress={() => navigation.navigate('Ürün Detayı', { product: item })}>
      <View style={item.isComplete ? styles.completedProductItem : styles.productItem}>
        <Image source={{ uri: item.photos[0] }} style={styles.productImage} resizeMode="cover" />
        <Text style={styles.productName}  color={item.isComplete ? "gray" : "red"}  >{item.title}</Text>
        <Text style={styles.productLocation} color={item.isComplete ? "gray" : "red"}>{item.city}, {item.district}</Text>
      </View>
    </TouchableOpacity>
  );

  // Profil fotoğrafını seçme işlemi
  const selectProfileImage = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Kütüphane erişim izni reddedildi!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      console.log('a');
      if (!result.canceled && result.assets.length > 0) {
        console.log('b');
        // Eğer seçim işlemi iptal edilmediyse ve en az bir fotoğraf seçildiyse
        // İlk fotoğrafın URI'sini alarak Firebase Storage'a yükle
        const firstPhoto = result.assets[0];
        uploadProfileImage(firstPhoto.uri);
        // console.log(firstPhoto.uri);
      } else {
        console.log('Fotoğraf seçilmedi veya seçim işlemi iptal edildi.');
        Alert.alert('Hata', 'Profil resmi seçilirken bir hata oluştu.');
      }
    } catch (error) {
      console.error('Profil resmi seçilirken bir hata oluştu:', error);
    } finally {
      setLoading(false); // Yükleme durumunu kapat
    }
  };

  // Profil fotoğrafını Firebase Storage'a yükleme işlemi
  const uploadProfileImage = async (uri) => {
    try {
      setLoading(true);   
      const user = firebaseAuth.currentUser;
      const fileName = `profile_images/${user.uid}`;
      const fileRef = ref(storage, fileName);
      const response = await fetch(uri);
      const blob = await response.blob();
      console.log('gd');
      await uploadBytes(fileRef, blob); //burada sorun
      const downloadURL = await getDownloadURL(fileRef);
      setProfilePhoto(downloadURL);
      await updateProfile(user, {
        photoURL: downloadURL
      });
      setLoading(false); // Ekledim: Yükleme işlemi tamamlandığında loading state'ini false yap
      console.log('Profil fotoğrafı başarıyla yüklendi. URL:', downloadURL); // Ekledim: Başarıyla yüklendiğinde konsola URL'yi yazdır  
    } catch (error) {
      console.error('Profil resmi yüklenirken bir hata oluştu:', error);
      Alert.alert('Hata', 'Profil resmi yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
        if (user) {
          const photoURL = user.photoURL;
          if (photoURL) {
            setProfilePhoto(photoURL);
          }
        }
      });
  
      return () => unsubscribe();
    } catch (error) {
      console.error('Kullanıcı giriş durumu izlenirken bir hata oluştu:', error);
    }
  }, []);
  
  const renderHeader = () => (
    <>
      <Text style={styles.hiheader}>Profilim</Text>
      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={selectProfileImage} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="large" color="#B97AFF" />
          ) : (
            <View style={styles.profileImageContainer}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profileImage} />
              ) : (
                <Text style={styles.profilePlaceholder}>Profil Fotoğrafı Ekle</Text>
              )}
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.hiText}>Merhaba {firebaseAuth.currentUser.displayName}</Text>
      </View>
      <TouchableOpacity style={styles.exitContainer} onPress={() => firebaseAuth.signOut()}>
        <Text style={styles.exitText}>Çıkış yap</Text>
        <TouchableOpacity style={styles.exitButton} onPress={() => firebaseAuth.signOut()}>
          <FontAwesome name="sign-out" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
      <Text style={styles.header}>Yüklenen İlanlar</Text>
    </>
  );

  const renderFooter = () => (
    <>
      <Text style={styles.header}>Tamamlanan İlanlar</Text>
      <FlatList
        data={completedProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        extraData={completedProducts} 
      />
    </>
  );

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      data={userProducts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={styles.container}
    />
  );
}

function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;
  const handleDelete = async () => {
    Alert.alert(
      'Ürünü Sil',
      'Bu ürünü silmek istediğinize emin misiniz?',
      [
        {
          text: 'Hayır',
          style: 'cancel',
        },
        {
          text: 'Evet',
          onPress: async () => {
            try {
              const db = getFirestore();
              const productRef = doc(db, 'items', product.id);
              await deleteDoc(productRef);
              navigation.goBack();
            } catch (error) {
              console.error('Ürünü silerken bir hata oluştu:', error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleComplete = async () => {
    try {
      const db = getFirestore();
      const productRef = doc(db, 'items', product.id);
      await updateDoc(productRef, {
        isComplete: true
      });
      Alert.alert('Tebrikler', 'Ürünü sahibine ulaştırdınız.');
      navigation.goBack();
    } catch (error) {
      console.error('Ürünü güncellerken bir hata oluştu:', error);
      Alert.alert('Hata', 'Ürün güncellenirken bir hata oluştu.');
    }
  };

  // Bu kontrol, ürün tamamlandıysa butonları devre dışı bırakır
  const isCompleted = product.isComplete;
  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={product.photos}
        keyExtractor={(photo, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.productDetailImage} resizeMode="cover" />
        )}
      />
      <Text style={styles.productDetailName}>{product.title}</Text>
      <Text style={styles.productDetailLocation}>{product.city}, {product.district}</Text>
      <Text style={styles.productDetailDesc}>{product.description}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          disabled={isCompleted}
          onPress={handleComplete}>
          <FontAwesome name="check" size={24} color={isCompleted ? "gray" : "green"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          disabled={isCompleted}>
          <FontAwesome name="edit" size={24} color={isCompleted ? "gray" : "yellow"} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleDelete}>
          <FontAwesome name="trash" size={24} color= "red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
