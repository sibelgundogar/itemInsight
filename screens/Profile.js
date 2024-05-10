import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { firebaseAuth } from '../firebase';
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc, updateDoc } from 'firebase/firestore';

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

  return (
    //buralar scrollview olacak
     <View style={styles.container}> 
      <Text style={styles.hiheader}>Profilim</Text>
      <Text style={styles.hiText}>Merhaba</Text>
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
    marginTop:10
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
    marginBottom:5
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
    fontSize: 20,
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
  }
});

