import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Image, FlatList, Alert, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import SelectedPhoto from '../components/SelectedPhoto';
import SelectPhotoButton from '../components/SelectPhotoButton';
import SelectionDrawer from '../components/SelectionDrawer';
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, CameraType } from 'expo-image-picker';
import cities from '../data/cities';
import InlineListPicker from '../components/InlineListPicker';
import { Camera } from 'expo-camera';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import firestore from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL  } from 'firebase/storage';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

export default function New({ navigation }) {
  const [selectedPhotos, setSelectedPhotos] = useState(['addButton']);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState(0);
  const [loading, setLoading] = useState(false); 
  const db = getFirestore();
  const storage = getStorage();
  const { currentUser } = getAuth(); // Kullanıcıyı aldık

  const addPicture = () => {
    setModalVisible(true);
  }

  const takePicture = async () => {
    if (selectedPhotos.length >= 6) return;
    const { status } = await Camera.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      // console.log('Kamera izni reddedildi.');
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
      setLoading(true);
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
        userId: currentUser.uid, // Kullanıcı kimliğini ekle
        title: title,
        description: desc,
        city: cities[selectedCityIndex].il_adi,
        district: cities[selectedCityIndex].ilceler[selectedDistrictIndex].ilce_adi,
        photos: photoURLs,
        timestamp: serverTimestamp()

      };

      const docRef = await addDoc(collection(db, "items"), productData);
      // console.log("Ürün başarıyla eklendi:", docRef.id);
      Alert.alert('Tebrikler', 'Ürün başarıyla eklendi.');
      //sayfayı yeniliyor formun boşaltılması için
      navigation.replace("Home", { screen: "New" })
    } catch (error) {
      console.error('Ürün yükleme hatası:', error);
      Alert.alert('Hata', 'Ürün yüklenirken bir hatayla karşılaşıldı.');
    }finally {
      setLoading(false); // Yükleme tamamlandığında loading state'ini false olarak ayarla
    }
  };

  return (
    <TouchableWithoutFeedback disabled={loading} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {loading && <ActivityIndicator style={styles.activityIndicator} size="large" color="#B97AFF" />}
        <SelectionDrawer visible={modalVisible} onClose={() => { setModalVisible(false) }} options={[{ text: 'Camera', action: takePicture }, { text: 'Gallery', action: selectFromGallery }]}/>

        <View style={[styles.photoContainer, { opacity: loading ? 0.4 : 1 }]}>
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

        <TouchableOpacity style={[styles.uploadButton, { opacity: loading ? 0.4 : 1 }]} onPress={handleUpload} disabled={loading}>
          <Text style={styles.uploadButtonText}>Yükle</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative', 
  },
  activityIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  contentContainer: {
    padding: 20,
    marginHorizontal: 10
  },
  photoContainer: {
    borderWidth: 2,
    borderColor: '#B97AFF',
    borderStyle: 'dashed',
    marginBottom: 20,
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
