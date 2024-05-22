import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { collection, addDoc, updateDoc, getFirestore, serverTimestamp, doc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { firebaseAuth } from '../firebase';

export default ItemForm = ({ navigation, product, isEdit }) => {
  const [title, setTitle] = useState(product ? product.title : '');
  const [description, setDescription] = useState(product ? product.description : '');
  const [city, setCity] = useState(product ? product.city : '');
  const [district, setDistrict] = useState(product ? product.district : '');
  const [photos, setPhotos] = useState(product ? product.photos : []);
  const [loading, setLoading] = useState(false);

  const handleAddOrUpdateProduct = async () => {
    if (!title || !description || !city || !district || photos.length === 0) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun ve en az bir fotoğraf ekleyin.');
      return;
    }

    setLoading(true);

    try {
      const db = getFirestore();
      const storage = getStorage();
      const user = firebaseAuth.currentUser;
      const uploadedPhotos = [];

      for (const photo of photos) {
        if (photo.startsWith('http')) {
          uploadedPhotos.push(photo);
        } else {
          const response = await fetch(photo);
          const blob = await response.blob();
          const fileName = `product_images/${user.uid}/${Date.now()}_${Math.random()}`;
          const fileRef = ref(storage, fileName);
          await uploadBytes(fileRef, blob);
          const downloadURL = await getDownloadURL(fileRef);
          uploadedPhotos.push(downloadURL);
        }
      }

      if (isEdit) {
        const productRef = doc(db, 'items', product.id);
        await updateDoc(productRef, {
          title,
          description,
          city,
          district,
          photos: uploadedPhotos,
          timestamp: serverTimestamp(),
        });
        Alert.alert('Başarılı', 'Ürün başarıyla güncellendi.');
      } else {
        await addDoc(collection(db, 'items'), {
          userId: user.uid,
          title,
          description,
          city,
          district,
          photos: uploadedPhotos,
          timestamp: serverTimestamp(),
          isComplete: false,
        });
        Alert.alert('Başarılı', 'Ürün başarıyla eklendi.');
      }

      setTitle('');
      setDescription('');
      setCity('');
      setDistrict('');
      setPhotos([]);
      setLoading(false);

      navigation.goBack();
    } catch (error) {
      setLoading(false);
      Alert.alert('Hata', 'İşlem sırasında bir hata oluştu.');
    }
  };

  const selectImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Erişim İzni Gerekli', 'Fotoğraflarınıza erişim izni verilmedi.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const selectedPhotos = result.assets.map((asset) => asset.uri);
      setPhotos((prevPhotos) => [...prevPhotos, ...selectedPhotos]);
    }
  };

  const removeImage = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>{isEdit ? 'Ürünü Güncelle' : 'Yeni Ürün Ekle'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Başlık"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Açıklama"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Şehir"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="İlçe"
        value={district}
        onChangeText={setDistrict}
      />
      <TouchableOpacity style={styles.button} onPress={selectImages}>
        <Text style={styles.buttonText}>Fotoğraf Seç</Text>
      </TouchableOpacity>
      <ScrollView horizontal style={styles.imagesContainer}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri: photo }} style={styles.image} />
            <TouchableOpacity style={styles.removeButton} onPress={() => removeImage(index)}>
              <Text style={styles.removeButtonText}>X</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Button
        title={isEdit ? 'Ürünü Güncelle' : 'Ürünü Ekle'}
        onPress={handleAddOrUpdateProduct}
        disabled={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 4,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 50,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});


