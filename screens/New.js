import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Modal, Image, FlatList } from 'react-native';
import SelectedPhoto from '../components/SelectedPhoto';
import SelectPhotoButton from '../components/SelectPhotoButton';
import SelectionDrawer from '../components/SelectionDrawer';
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, CameraType } from 'expo-image-picker';
import cities from '../data/cities';
import InlineListPicker from '../components/InlineListPicker';

export default function New() {
  const [selectedPhotos, setSelectedPhotos] = useState(['addButton']);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState(0);

  const addPicture = () => {
    setModalVisible(true);
  }

  const takePicture = async () => {
    if (selectedPhotos.length >= 6) return;
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
      <InlineListPicker label='İlçe' items={cities[selectedCityIndex].ilceler} onSelect={handleDistrictPicker} renderItemLabel={(value, index) => value.ilce_adi} />

      <TouchableOpacity style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>Yükle</Text>
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
    marginVertical: 40,
    backgroundColor: '#B97AFF',
    padding: 10,
    borderRadius: 5,
  },
  uploadButtonText: {
    color: 'white',
    textAlign: 'center',
  }
});