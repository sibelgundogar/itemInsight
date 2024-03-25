import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, Modal, Image, FlatList } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { Camera } from 'expo-camera';
import { Permissions } from 'expo-permissions';
import SelectedPhoto from '../components/SelectedPhoto';
import SelectPhotoButton from '../components/SelectPhotoButton';
import SelectionDrawer from '../components/SelectionDrawer';
import * as ImagePicker from 'react-native-image-picker';

export default function New() {
  const [selected, setSelected] = React.useState('');
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [hasPermission, setHasPermission] = useState(false);
  const [cameraWorking, setCameraWorking] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState(['addButton']);
  const [lastTakenPhoto, setLastTakenPhoto] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  let camera = useRef(null);

  const addPicture = () => {
    setModalVisible(true);
  }

  const takePicture = async () => {
    try {
      ImagePicker.launchCamera({
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 200,
        maxWidth: 200,
      }, console.log).catch(console.log);
    } catch (e) {
      console.log(e);
    }


    // if (!hasPermission) {
    //   const { status } = await Camera.requestCameraPermissionsAsync();
    //   let _hasPermission = status === 'granted';
    //   setHasPermission(_hasPermission);

    //   if (!_hasPermission) return;
    // }
    // if (!cameraWorking) {
    //   setCameraWorking(true)
    // }

    // if (cameraWorking && camera) {
    //   let picture = await camera.takePictureAsync();
    //   let newPhotos = [...selectedPhotos];
    //   newPhotos.splice(1, 0, picture.uri);
    //   setSelectedPhotos(newPhotos);
    // }
  };

  const selectFromGallery = () => {
    ImagePicker.launchImageLibrary();
  }

  const removePicture = (index) => {
    let newPhotos = [...selectedPhotos];
    newPhotos.splice(index, 1);
    setSelectedPhotos(newPhotos);
  }







  // Select listlerin içini doldurmak için örnek şehir ve ilçe bilgileri
  const city = [
    { value: 'Istanbul' },
    { value: 'Balikesir' },
    { value: 'Izmir' },
    { value: 'Bursa' },
    { value: 'Ankara' },
  ];
  const district = [
    { value: 'Eyup' },
    { value: 'Esenler' },
    { value: 'Altieylul' },
    { value: 'Karesi' },
    { value: 'Urla' },
    { value: 'Osmangazi' },
    { value: 'Cankaya' },
  ];

  return (
    <ScrollView style={styles.container}>
      <SelectionDrawer visible={modalVisible} onClose={() => { setModalVisible(false) }} options={[{ text: 'Camera', action: takePicture }, { text: 'Gallery', action: selectFromGallery }]} />


      {cameraWorking ?
        <View style={{ height: "40%" }}>
          <Camera
            style={{ height: '100%', width: "100%" }}
            ref={(r) => {
              camera = r;
            }} />
        </View>

        : null}
      <View style={styles.photoContainer}>
        <FlatList horizontal data={selectedPhotos} renderItem={({ item, index }) => (
          (item === 'addButton') ? (selectedPhotos.length === 6) ? null : <SelectPhotoButton onPress={addPicture} /> : <SelectedPhoto onDelete={() => { removePicture(index) }} src={item} />
        )}
        />

      </View>

      {(lastTakenPhoto !== '') ? <Image src={lastTakenPhoto} width={300} height={100} style={{ width: "100%", height: "30%" }} /> : null}
      <Text style={styles.inputText}>Ürün Başlığı</Text>
      <TextInput style={styles.input} placeholder="Ürün Başlığı" />

      <Text style={styles.inputText}>Ürün Açıklaması</Text>
      <TextInput style={styles.textArea} placeholder="Ürün Açıklaması" multiline />

      <View style={styles.selectListContainer}>

        <View style={styles.selectList}>
          <Text style={styles.inputText}>İl</Text>
          <SelectList setSelected={(val) => setSelected(val)} data={city} save="value" />
        </View>

        <View style={styles.selectList}>
          <Text style={styles.inputText}>İlçe</Text>
          <SelectList setSelected={(val) => setSelected(val)} data={district} save="value" />
        </View>
      </View>

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
  selectList: {
    width: 155,
  }
});