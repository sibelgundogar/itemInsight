import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
// import { firebaseAuth } from '../firebase';
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
            photos: data.photos
          });
        } else {
          productsData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            city: data.city,
            district: data.district,
            photos: data.photos
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
      <View style={completedProducts.includes(item) ? styles.completedProductItem : styles.productItem}>
        <Image source={{ uri: item.photos[0] }} style={styles.productImage} resizeMode="cover" />
        <Text style={completedProducts.includes(item) ? styles.completedProductName : styles.productName}>{item.title}</Text>
        <Text style={completedProducts.includes(item) ? styles.completedProductLocation : styles.productLocation}>{item.city}, {item.district}</Text>
      </View>
    </TouchableOpacity>
  );


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
        // Eğer seçim işlemi iptal edilmediyse ve en az bir fotoğraf seçildiyse
        // İlk fotoğrafın URI'sini alarak Firebase Storage'a yükle
        const firstPhoto = result.assets[0];
        uploadProfileImage(firstPhoto.uri);
        console.log(firstPhoto.uri);
      } else {
        console.log('Fotoğraf seçilmedi veya seçim işlemi iptal edildi.');
      }
    } catch (error) {
      console.error('Profil resmi seçilirken bir hata oluştu:', error);
    }
  };


  // Profil fotoğrafını Firebase Storage'a yükleme işlemi
 // Profil fotoğrafını Firebase Storage'a yükleme işlemi
const uploadProfileImage = async (uri) => {
  try {
    const user = firebaseAuth.currentUser;
    const fileName = `profile_images/${user.uid}`;
    const storageRef = ref(storage, fileName);
    const response = await fetch(uri);
    const blob = await response.blob();
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    
    // Firebase Authentication'da kullanıcının profil bilgilerini güncelle
    await updateProfile(user, {
      photoURL: downloadURL
    });

    // Profil fotoğrafı URI'sini state'e kaydet
    setProfilePhoto(downloadURL);
  } catch (error) {
    console.error('Profil resmi yüklenirken bir hata oluştu:', error);
    Alert.alert('Hata', 'Profil resmi yüklenirken bir hata oluştu.');
  } finally {
    setLoading(false);
  }
};


//kullanıcının fotosunu çekme 
useEffect(() => {
  // Kullanıcı giriş yaptığında
  const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
    if (user) {
      // Kullanıcının Firebase Authentication'dan gelen profil fotoğrafı URL'sini kontrol et
      const photoURL = user.photoURL;
      if (photoURL) {
        // Eğer profil fotoğrafı URL'si varsa, state'e kaydedilerek profil fotoğrafını güncelle
        setProfilePhoto(photoURL);
      }
    }
  });

  // useEffect'in cleanup fonksiyonu
  return () => unsubscribe();
}, []);
  return (
    //buralar scrollview olacak
    <View style={styles.container}>
      <Text style={styles.hiheader}>Profilim</Text>

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


      <TouchableOpacity style={styles.exitContainer} onPress={() => firebaseAuth.signOut()}>
        <Text style={styles.exitText}>Çıkış yap</Text>
        <TouchableOpacity style={styles.exitButton} onPress={() => firebaseAuth.signOut()}>
          <FontAwesome name="sign-out" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>

      <Text style={styles.header}>Yüklediğim İlanlar</Text>
      <FlatList
        data={userProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        extraData={userProducts} // Added extraData to force re-render when userProducts change
      />

      <Text style={styles.header}>Tamamlanan İlanlar</Text>
      <FlatList
        data={completedProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        extraData={completedProducts} // Added extraData to force re-render when completedProducts change
      />


    </View> //buralar scrollview
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
        {/* isCompleted değerine göre butonları devre dışı bırak */}
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
          disabled={isCompleted}
          onPress={handleDelete}>
          <FontAwesome name="trash" size={24} color={isCompleted ? "gray" : "red"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10
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
    marginBottom: 5
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
    width: 370,
    height: 370,
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
  hiheader: {
    fontSize: 23,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  completedProductItem: {
    opacity: 0.4,
    width: 170,
    borderColor: '#B97AFF',
    borderWidth: 2,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginBottom: 5,
  },
  completedProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: 'gray',
  },
  completedProductLocation: {
    fontSize: 14,
    color: '#6700A9',
    marginTop: 5,
    color: 'gray',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderColor: '#B97AFF',
    borderWidth: 2
  },
  profileImageContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  profilePlaceholder: {
    fontSize: 18,
    color: 'gray',
    textAlign: 'center',
  },
});

