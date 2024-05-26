import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, updateProfile } from 'firebase/auth';
import { firebaseAuth } from '../firebase';

const Stack = createStackNavigator();
const db = getFirestore();

export default function Profile() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profil" component={ProfileScreen} />
      <Stack.Screen name="Ürün Detayı" component={ItemDetailScreen} />
    </Stack.Navigator>
  );
}

function ProfileScreen({ navigation }) {
  const [uploadedItems, setUploadedItems] = useState([]);
  const [completedItems, setCompletedItems] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null); // Profil fotoğrafı state'i
  const [loading, setLoading] = useState(false); // Yükleme durumu
  const storage = getStorage();
  const { currentUser } = getAuth();

  const fetchUploadedItems = useCallback(async () => {
    try {
      // Firestore'dan veri çekmek için bir sorgu oluşturuyoruz. kullanıcının yüklediği item ları alır
      const q = query(collection(db, 'items'), where('userId', '==', currentUser.uid));
      // getDocs fonksiyonu sorguyu kullanarak Firestore'dan verileri asenkron olarak alır ve document değişkenine atar.
      const document = await getDocs(q);
      // Yüklenmiş ürünler ve tamamlanmış ürünler için iki ayrı dizi tanımlanır
      let uploadedItemsData = [];
      let completedItemsData = [];
      // forEach ile document içindeki doc için bir döngü başlatır.
      document.forEach((doc) => {
        // doc.data() ile  her belgenin (doc) içindeki veriyi alır ve data değişkenine atar.
        const data = doc.data();
        // Eğer ürün tamamlanmışsa completedItemsData dizisine eklenir
        if (data.isComplete) {
          completedItemsData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            city: data.city,
            district: data.district,
            photos: data.photos,
            isComplete: data.isComplete,
            timestamp: data.timestamp
          });
          // Eğer ürün tamamlanmamışsa uploadedItemsData dizisine eklenir
        } else {
          uploadedItemsData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            city: data.city,
            district: data.district,
            photos: data.photos,
            isComplete: data.isComplete,
            timestamp: data.timestamp
          });
        }
      });
      // Yüklenmiş ve tamamlanmış ürünleri zamana göre sıralar
      uploadedItemsData = uploadedItemsData.sort((a, b) => b.timestamp - a.timestamp);
      completedItemsData = completedItemsData.sort((a, b) => b.timestamp - a.timestamp);

      // Yüklenmiş ürünleri ve tamamlanmış ürünleri state'e kaydeder
      setUploadedItems(uploadedItemsData);
      setCompletedItems(completedItemsData);
    } catch (error) {
      console.error('Kullanıcı ürünlerini alırken bir hata oluştu:', error);
    }
  }, [currentUser.uid]);  // currentUser.uid değişirse, fetchUploadedItems fonksiyonu yeniden oluşturulacak

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUploadedItems();
    });
    return unsubscribe;
  }, [navigation, fetchUploadedItems]);


  // Her bir ürünü render ediyor
  const renderItem = ({ item }) => (
    // Öğeye tıklandığında o öğenin detay sayfasına yönlendirir ve item verilerini bu ekrana gönderir.
    <TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('Ürün Detayı', { itemDetail: item })}>
      <View style={item.isComplete ? styles.completedItem : styles.uploadedItem}>
        <Image source={{ uri: item.photos[0] }} style={styles.itemImage} resizeMode="cover" />
        <Text style={styles.itemName} >{item.title}</Text>
        <Text style={styles.itemLocation}>{item.city}, {item.district}</Text>
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
      if (!result.canceled && result.assets.length > 0) {
        // Eğer seçim işlemi iptal edilmediyse ve en az bir fotoğraf seçildiyse
        // İlk fotoğrafın URI'sini alarak Firebase Storage'a yükle
        const firstPhoto = result.assets[0];
        uploadProfileImage(firstPhoto.uri);
      } else {
        // Alert.alert('Hata', 'Profil resmi seçilirken bir hata oluştu.');
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
      const user = currentUser.uid;
      const fileName = `profile_images/${user.uid}`;
      const fileRef = ref(storage, fileName);
      const response = await fetch(uri);
      const blob = await response.blob();
      console.log('hata hata hata');
      await uploadBytes(fileRef, blob); //burada sorun
      const downloadURL = await getDownloadURL(fileRef);
      setProfilePhoto(downloadURL);
      await updateProfile(user, {
        photoURL: downloadURL
      });
      setLoading(false); // Ekledim: Yükleme işlemi tamamlandığında loading state'ini false yap
      // console.log('Profil fotoğrafı başarıyla yüklendi. URL:', downloadURL); // Ekledim: Başarıyla yüklendiğinde konsola URL'yi yazdır  
    } catch (error) {
      // console.error('Profil resmi yüklenirken bir hata oluştu:', error);
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
      <Text style={styles.profileHeader}>Profilim</Text>
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
        <Text style={styles.hiText}>Merhaba {currentUser.displayName}</Text>
      </View>
      <TouchableOpacity style={styles.exitContainer} onPress={() => firebaseAuth.signOut()}>
        <Text style={styles.exitText}>Çıkış yap</Text>
        <TouchableOpacity style={styles.exitButton} onPress={() => firebaseAuth.signOut()}>
          <FontAwesome name="sign-out" size={24} color="red" />
        </TouchableOpacity>
      </TouchableOpacity>
      <Text style={styles.itemHeader}>Yüklenen İlanlar</Text>
    </>
  );

  const renderCompleted = () => (
    <>
      <Text style={styles.itemHeader}>Tamamlanan İlanlar</Text>
      <FlatList
        data={completedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        extraData={completedItems}
      />
    </>
  );

  return (
    <FlatList
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderCompleted}
      data={uploadedItems}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={2}
      contentContainerStyle={styles.container}
    />
  );
}


function ItemDetailScreen({ route, navigation }) {
  const { itemDetail } = route.params;
  const [activeIndex, setActiveIndex] = useState(0);
  const isCompleted = itemDetail.isComplete;

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
              const docRef = doc(db, 'items', itemDetail.id);
              await deleteDoc(docRef);
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
      const docRef = doc(db, 'items', itemDetail.id);
      await updateDoc(docRef, {
        isComplete: true
      });
      Alert.alert('Tebrikler', 'Ürünü sahibine ulaştırdınız.');
      navigation.goBack();
    } catch (error) {
      console.error('Ürünü güncellerken bir hata oluştu:', error);
      Alert.alert('Hata', 'Ürün güncellenirken bir hata oluştu.');
    }
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(contentOffsetX / viewSize);
    setActiveIndex(index);
  };


  return (
    <View style={styles.itemDetailContainer}>
      {/* <FlatList
        horizontal
        data={item.photos}
        keyExtractor={(photo, index) => index.toString()}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.itemDetailImage} resizeMode="cover" />
        )}
      /> */}
      <ScrollView
        horizontal
        pagingEnabled // Ekran boyutunda sayfa geçişi için pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {itemDetail.photos.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={{ ...styles.itemDetailImage }}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <View style={styles.paginationContainer}>
        {itemDetail.photos.map((_, index) => (
          <View key={index} style={[styles.dot, { opacity: index === activeIndex ? 1 : 0.3 }]} />
        ))}
      </View>
      <Text style={styles.itemDetailName}>{itemDetail.title}</Text>
      <Text style={styles.itemDetailLocation}>{itemDetail.city}, {itemDetail.district}</Text>
      <Text style={styles.itemDetailDesc}>{itemDetail.description}</Text>
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
          <FontAwesome name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    // flex: 1,
    padding: 10,
  },
  itemContainer: {
    flex: 1,
    margin: 5,
  },
  uploadedItem: {
    width: 173,
    borderColor: '#B97AFF',
    borderWidth: 2,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginBottom: 5
  },
  completedItem: {
    opacity: 0.3,
    width: 173,
    borderColor: '#B97AFF',
    borderWidth: 2,
    borderRadius: 15,
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginBottom: 5,
  },
  itemImage: {
    width: '100%',
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
    marginHorizontal: -10
  },
  itemDetailContainer: {
    marginVertical: 20
  },
  itemDetailImage: {
    alignSelf: 'center',
    width: 370,
    height: 370,
    borderRadius: 5,
    marginBottom: 15,
    marginHorizontal: 10,
  },
  itemDetailName: {
    marginLeft: 20,
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 10,
  },
  itemDetailLocation: {
    marginLeft: 20,
    fontSize: 16,
    color: '#6700A9',
    marginTop: 5,
  },
  itemDetailDesc: {
    marginLeft: 20,
    fontSize: 17,
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
  profileHeader: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImageContainer: {
    width: 130,
    height: 130,
    borderRadius: 75,
    backgroundColor: '#D3D3D3',
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#B97AFF',
    borderWidth: 2,
    marginBottom: 8,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 75,
    borderColor: '#B97AFF',
    borderWidth: 1,
  },
  profilePlaceholder: {
    fontSize: 18,
    color: 'black',
    textAlign: 'center',
    margin: 5
  },
  hiText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'gray'
  },
  exitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 250,
    marginRight: 10,
    marginBottom: 20,
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
  itemHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  dot: {
    height: 9,
    width: 9,
    borderRadius: 5,
    backgroundColor: '#B97AFF',
    marginHorizontal: 5,
  },
});

