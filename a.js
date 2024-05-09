import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { firebaseAuth } from '../firebase';
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';

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
  const currentUser = firebaseAuth.currentUser;

  useEffect(() => {
    const fetchUserProducts = async () => {
      try {
        const db = getFirestore();
        const q = query(collection(db, 'items'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const productsData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          productsData.push({
            id: doc.id,
            title: data.title,
            description: data.description,
            city: data.city,
            district: data.district,
            photos: data.photos
          });
        });
        setUserProducts(productsData);
      } catch (error) {
        console.error('Kullanıcı ürünlerini alırken bir hata oluştu:', error);
      }
    };
    fetchUserProducts();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.productItemContainer}
      onPress={() => navigation.navigate('Ürün Detayı', { product: item })}>
      <View style={styles.productItem}>
        <Image source={{ uri: item.photos[0] }} style={styles.productImage} resizeMode="cover" />
        <Text style={styles.productName}>{item.title}</Text>
        <Text style={styles.productLocation}>{item.city}, {item.district}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profilim</Text>
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
      />
    </View>
  );
}

function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;

  const handleDelete = async () => {
    try {
      const db = getFirestore();
      const productRef = doc(db, 'items', product.id);
      await deleteDoc(productRef);
      navigation.goBack();
    } catch (error) {
      console.error('Ürünü silerken bir hata oluştu:', error);
    }
  };

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
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="check" size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="edit" size={24} color="yellow" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
          <FontAwesome name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}



//correct.
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { firebaseAuth } from '../firebase';
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';

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
  const currentUser = firebaseAuth.currentUser;

  const fetchUserProducts = useCallback(async () => {
    try {
      const db = getFirestore();
      const q = query(collection(db, 'items'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const productsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        productsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          city: data.city,
          district: data.district,
          photos: data.photos
        });
      });
      setUserProducts(productsData);
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
      <View style={styles.productItem}>
        <Image source={{ uri: item.photos[0] }} style={styles.productImage} resizeMode="cover" />
        <Text style={styles.productName}>{item.title}</Text>
        <Text style={styles.productLocation}>{item.city}, {item.district}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profilim</Text>
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
    </View>
  );
}

function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;

  const handleDelete = async () => {
    try {
      const db = getFirestore();
      const productRef = doc(db, 'items', product.id);
      await deleteDoc(productRef);
      navigation.goBack();
    } catch (error) {
      console.error('Ürünü silerken bir hata oluştu:', error);
    }
  };

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
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="check" size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="edit" size={24} color="yellow" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
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

----
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, Alert } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { firebaseAuth } from '../firebase';
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';

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
  const currentUser = firebaseAuth.currentUser;

  const fetchUserProducts = useCallback(async () => {
    try {
      const db = getFirestore();
      const q = query(collection(db, 'items'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const productsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        productsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          city: data.city,
          district: data.district,
          photos: data.photos
        });
      });
      setUserProducts(productsData);
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
      <View style={styles.productItem}>
        <Image source={{ uri: item.photos[0] }} style={styles.productImage} resizeMode="cover" />
        <Text style={styles.productName}>{item.title}</Text>
        <Text style={styles.productLocation}>{item.city}, {item.district}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profilim</Text>
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
    </View>
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
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="check" size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="edit" size={24} color="yellow" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
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
-----------

return (
  <View style={styles.container}>

    <Text style={styles.inputText}>Ürün Başlığı</Text>
    <TextInput
      style={styles.input}
      placeholder="Ürün Başlığı"
      value={productData.title}
      onChangeText={(text) => setProductData({ ...productData, title: text })}
    />

    <Text style={styles.inputText}>Ürün Açıklaması</Text>
    <TextInput
      style={styles.textArea}
      placeholder="Ürün Açıklaması"
      multiline
      value={productData.description}
      onChangeText={(text) => setProductData({ ...productData, description: text })}
    />

    <Text style={styles.label}>Şehir</Text>
    <TextInput
      style={styles.input}
      placeholder="Şehir"
      value={productData.city}
      onChangeText={(text) => setProductData({ ...productData, city: text })}
    />

    <Text style={styles.label}>İlçe</Text>
    <TextInput
      style={styles.input}
      placeholder="İlçe"
      value={productData.district}
      onChangeText={(text) => setProductData({ ...productData, district: text })}
    />

    <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProduct}>
      <Text style={styles.updateButtonText}>Güncelle</Text>
    </TouchableOpacity>
  </View>
);
//edit denemesi
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { firebaseAuth } from '../firebase';
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc, getDoc } from 'firebase/firestore';
import cities from '../data/cities';
import InlineListPicker from '../components/InlineListPicker';

const Stack = createStackNavigator();

export default function Profile() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profil" component={ProfileScreen} options={{ headerShown: true, headerBackVisible: false }} />
      <Stack.Screen name="Ürün Detayı" component={ProductDetailScreen} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} />
    </Stack.Navigator>
  );
}

function ProfileScreen({ navigation }) {
  const [userProducts, setUserProducts] = useState([]);
  const currentUser = firebaseAuth.currentUser;

  const fetchUserProducts = useCallback(async () => {
    try {
      const db = getFirestore();
      const q = query(collection(db, 'items'), where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      const productsData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        productsData.push({
          id: doc.id,
          title: data.title,
          description: data.description,
          city: data.city,
          district: data.district,
          photos: data.photos
        });
      });
      setUserProducts(productsData);
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
      <View style={styles.productItem}>
        <Image source={{ uri: item.photos[0] }} style={styles.productImage} resizeMode="cover" />
        <Text style={styles.productName}>{item.title}</Text>
        <Text style={styles.productLocation}>{item.city}, {item.district}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profilim</Text>
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
    </View>
  );
}

function ProductDetailScreen({ route, navigation }) {
  const { product } = route.params;

  const handleEdit = () => {
    // productId ile EditProductScreen'e yönlendirme yap
    navigation.navigate('EditProduct', { productId: product.id });
  };

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
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="check" size={24} color="green" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <FontAwesome name="edit" size={24} color="yellow" onPress={handleEdit} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
          <FontAwesome name="trash" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}


function EditProductScreen({ route, navigation }) {
  const { productId } = route.params;
  const [productData, setProductData] = useState({
    title: '',
    description: '',
    city: '',
    district: '',
  });


  const handleCityPicker = (value, index) => {
    setSelectedCityIndex(index);
  };

  const handleDistrictPicker = (value, index) => {
    setSelectedDistrictIndex(index);
  }

  useEffect(() => {
    // Ürün verilerini Firestore'dan al
    const fetchProductData = async () => {
      try {
        const db = getFirestore();
        const productRef = doc(db, 'items', productId);
        const productSnapshot = await getDoc(productRef);
        if (productSnapshot.exists()) {
          const data = productSnapshot.data();
          setProductData({
            title: data.title || '',
            description: data.description || '',
            city: data.city || '',
            district: data.district || '',
          });
        } else {
          console.error('Ürün bulunamadı.');
        }
      } catch (error) {
        console.error('Ürün verilerini alırken bir hata oluştu:', error);
      }
    };

    fetchProductData();
  }, [productId]);

  const handleUpdateProduct = async () => {
    try {
      const db = getFirestore();
      const productRef = doc(db, 'items', productId);
      await updateDoc(productRef, {
        title: productData.title,
        description: productData.description,
        city: productData.city,
        district: productData.district,
      });
      console.log('Ürün başarıyla güncellendi.');
      navigation.goBack();
    } catch (error) {
      console.error('Ürün güncellenirken bir hata oluştu:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ürün Başlığı</Text>
      <TextInput
        style={styles.input}
        placeholder="Ürün Başlığı"
        value={productData.title}
        onChangeText={(text) => setProductData({ ...productData, title: text })}
      />

      <Text style={styles.inputText}>Ürün Açıklaması</Text>
      <TextInput
        style={styles.textArea}
        placeholder="Ürün Açıklaması"
        multiline
        value={productData.description}
        onChangeText={(text) => setProductData({ ...productData, description: text })}
      />

      <InlineListPicker label='İl' items={cities} onSelect={handleCityPicker} renderItemLabel={(value, index) => value.il_adi} value={productData.city} onChangeText={(text) => setProductData({ ...productData, city: text })} />
      <InlineListPicker label='İlçe' items={cities[selectedCityIndex].ilceler} onSelect={handleDistrictPicker} renderItemLabel={(value, index) => { print(value); return value.ilce_adi; }} value={productData.district} onChangeText={(text) => setProductData({ ...productData, district: text })} />

      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateProduct}>
        <Text style={styles.updateButtonText}>Güncelle</Text>
      </TouchableOpacity>
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
  photoContainer: {
    borderWidth: 2,
    borderColor: '#B97AFF',
    borderStyle: 'dashed',
    marginVertical: 20,
    borderRadius: 10,
    height: 125
  },
  inputText: {
    fontSize: 15,
    marginVertical: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  textArea: {
    height: 80,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    verticalAlign: 'top',
  },
  updateButton: {
    marginVertical: 20,
    backgroundColor: '#B97AFF',
    padding: 10,
    borderRadius: 5,
  },
  updateButtonText: {
    color: 'white',
    textAlign: 'center',
  }
});

