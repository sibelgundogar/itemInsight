import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Modal, Image, FlatList } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import SelectedPhoto from '../components/SelectedPhoto';
import SelectPhotoButton from '../components/SelectPhotoButton';
import SelectionDrawer from '../components/SelectionDrawer';
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, CameraType } from 'expo-image-picker';
import cities from '../data/cities';
import { Picker } from '@react-native-picker/picker';

export default function New() {
  // const [hasPermission, setHasPermission] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState(['addButton']);
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [selectedCity, setSelectedCity] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState(cities[0].ilceler[0]);
  // const [showPicker, setShowPicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDistrictPicker, setShowDistrictPicker] = useState(false);

  // let camera = useRef(null);

  const addPicture = () => {
    setModalVisible(true);
  }

  const takePicture = async () => {

    // if (!hasPermission) {
    //   const { status } = await Camera.requestCameraPermissionsAsync();
    //   let _hasPermission = status === 'granted';
    //   setHasPermission(_hasPermission);

    //   if (!_hasPermission) return;
    // }
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


  const toggleCityPicker = () => {
    setShowCityPicker(!showCityPicker);
  };

  const handleCityChange = (val, index) => {
    setSelectedCity(index);
  };

  const handleCityConfirm = () => {
    toggleCityPicker(); // Picker'ı kapat
  };

  const toggleDistrictPicker = () => {
    setShowDistrictPicker(!showDistrictPicker);
  };
  const handleDistrictChange = (val, index) => {
    setSelectedDistrict(selectedCity.ilceler(index))
  }
  const handleDistrictConfirm = () => {
    toggleDistrictPicker(); // Picker'ı kapat
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

      {/* for(let city of cities){
    city.ilceler  */}


      <View>
        <Text style={styles.inputText}>İl</Text>
        <TouchableOpacity onPress={toggleCityPicker}>
          <View style={styles.inputCity}>
            <Text>{cities[selectedCity].il_adi}</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.inputText}>İlçe</Text>
        <TouchableOpacity onPress={toggleDistrictPicker}>
          <View style={styles.inputCity}>
            <Text>{ }</Text>
          </View>
        </TouchableOpacity>

        {showCityPicker && (
          <View style={styles.pickerWrapper}>
            <View style={styles.pickerDoneWrapper}>
              <TouchableOpacity onPress={handleCityConfirm}>
                <Text style={styles.pickerDoneText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleCityConfirm}>
                <Text style={styles.pickerDoneText}>Tamam</Text>
              </TouchableOpacity>
            </View>

            <Picker selectedValue={selectedCity} onValueChange={handleCityChange} mode='dropdown' >
              {cities.map((val, index) => {
                return (
                  <Picker.Item label={val.il_adi} value={index} />
                )
              })}
            </Picker>

            <Picker selectedValue={selectedDistrict} onValueChange={handleDistrictChange} mode='dropdown' >
              {cities[selectedCity].ilceler.map((val, index) => {
                return (
                  <Picker.Item label={val.ilceler} value={index} />
                )
              })}
            </Picker>
          </View>
        )}
      </View>

      {/* <View style={styles.selectList}>
          <Text style={styles.inputText}>İlçe</Text>
          <SelectList setSelectedDistrict={(val) => setSelectedDistrict(val)} data={district} save="value" />
        </View> */}


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
  photoButton: {
    alignSelf: 'center',
    marginVertical: 10,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#B97AFF',
    backgroundColor: '#DBB9EC',
    padding: 10,
    borderRadius: 5,
    width: 100,
    height: 100
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 45,
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
  },
  selectListContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  inputCity: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  pickerDoneText: {
    color: '#B97AFF',
    fontWeight: '700',
    fontSize: 18
  },
  pickerDoneWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  pickerWrapper: {
    backgroundColor: '#000000012',
    borderBottomStartRadius: 15,
    borderBottomEndRadius: 15,
  }
});