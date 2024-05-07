import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Modal, Image, FlatList, Alert } from 'react-native';
import SelectedPhoto from '../components/SelectedPhoto';
import SelectPhotoButton from '../components/SelectPhotoButton';
import SelectionDrawer from '../components/SelectionDrawer';
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, CameraType } from 'expo-image-picker';
import cities from '../data/cities';
import InlineListPicker from '../components/InlineListPicker';
import { Camera } from 'expo-camera';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import firestore from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';

export default function New({ navigation }) {
  const [selectedPhotos, setSelectedPhotos] = useState(['addButton']);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState(0);
  const db = getFirestore();
  const storage = getStorage();

  const addPicture = () => {
    setModalVisible(true);
  }

  const takePicture = async () => {
    if (selectedPhotos.length >= 6) return;
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      console.log('Kamera izni reddedildi.');
      return;
    }

    const result = await launchCameraAsync({
      aspect: [1, 1],
      allowsEditing: true,
      cameraType: CameraType.back,
      mediaTypes: MediaTypeOptions.Images,
      quality: 0.5,
    })

    if (result.canceled) return;

    let newPhotos = [...selectedPhotos];
    newPhotos.splice(1, 0, result.assets[0].uri);
    _setSelectedPhotos(newPhotos);
  };

  const selectFromGallery = async () => {
    if (selectedPhotos.length >= 6) return;
    const result = await launchImageLibraryAsync({
      aspect: [1, 1],
      mediaTypes: MediaTypeOptions.Images,
      quality: 0.5,
      allowsMultipleSelection: true,
      selectionLimit: 6 - selectedPhotos.length
    })

    if (result.canceled) return;

    let photos = result.assets.map((val) => val.uri)

    let newPhotos = [...selectedPhotos];
    newPhotos.splice(1, 0, ...photos);
    _setSelectedPhotos(newPhotos);
  }

  const _setSelectedPhotos = (photos) => {
    setSelectedPhotos(photos);
    if (modalVisible && photos.length >= 6) setModalVisible(false);
  }

  const removePicture = (index) => {
    let newPhotos = [...selectedPhotos];
    newPhotos.splice(index, 1);
    _setSelectedPhotos(newPhotos);
  }

  const handleCityPicker = (value, index) => {
    setSelectedCityIndex(index);
  };

  const handleDistrictPicker = (value, index) => {
    setSelectedDistrictIndex(index);
  }

  const handleUpload = async () => {
    if (selectedPhotos.length <= 1 || !title || !desc || selectedCityIndex === 0) {
      Alert.alert('Lütfen tüm alanları doldurun.');
      return;
    }
    try {
      // Resimleri Firebase Storage'a yükle
      const photoURLs = [];
      for (const photo of selectedPhotos) {
        if (photo !== 'addButton') {
          const fileName = photo.split('/').pop();
          const fileRef = ref(storage, fileName);
          const response = await fetch(photo);
          const blob = await response.blob();
          // console.log("uploading")
          await uploadBytes(fileRef, blob);
          // console.log("uploaded");
          const downloadURL = await getDownloadURL(fileRef);
          photoURLs.push(downloadURL);
        }
      }


      const productData = {
        title: title,
        description: desc,
        city: cities[selectedCityIndex].il_adi,
        district: cities[selectedCityIndex].ilceler[selectedDistrictIndex].ilce_adi,
        photos: photoURLs

      };

      const docRef = await addDoc(collection(db, "items"), productData);
      console.log("Ürün başarıyla eklendi:", docRef.id);
      Alert.alert('Tebrikler', 'Ürün başarıyla eklendi.');
      //sayfayı yeniliyor formun boşaltılması için
      navigation.replace("Home", { screen: "New" })
    } catch (error) {
      console.error('Ürün yükleme hatası:', error);
      Alert.alert('Hata', 'Ürün yüklenirken bir hatayla karşılaşıldı.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SelectionDrawer visible={modalVisible} onClose={() => { setModalVisible(false) }} options={[{ text: 'Camera', action: takePicture }, { text: 'Gallery', action: selectFromGallery }]} />

      <View style={styles.photoContainer}>
        <FlatList horizontal data={selectedPhotos} renderItem={({ item, index }) => (
          (item === 'addButton') ? (selectedPhotos.length >= 6) ? null : <SelectPhotoButton onPress={addPicture} /> : <SelectedPhoto onDelete={() => { removePicture(index) }} src={item} />
        )}
        />
      </View>

      <Text style={styles.inputText}>Ürün Başlığı</Text>
      <TextInput style={styles.input} placeholder="Ürün Başlığı" value={title} onChangeText={(text) => setTitle(text)} />

      <Text style={styles.inputText}>Ürün Açıklaması</Text>
      <TextInput style={styles.textArea} placeholder="Ürün Açıklaması" multiline value={desc} onChangeText={(text) => setDesc(text)} />

      <InlineListPicker label='İl' items={cities} onSelect={handleCityPicker} renderItemLabel={(value, index) => value.il_adi} />
      <InlineListPicker label='İlçe' items={cities[selectedCityIndex].ilceler} onSelect={handleDistrictPicker} renderItemLabel={(value, index) => { print(value); return value.ilce_adi; }} />

      <TouchableOpacity style={styles.uploadButton}>
        <Text style={styles.uploadButtonText} onPress={handleUpload}>Yükle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginHorizontal: 10
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
  uploadButton: {
    marginVertical: 20,
    backgroundColor: '#B97AFF',
    padding: 10,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: 'white',
    textAlign: 'center',
  }
});