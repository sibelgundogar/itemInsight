import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { Camera } from 'expo-camera';
import { launchCameraAsync, launchImageLibraryAsync, MediaTypeOptions, CameraType } from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import SelectedPhoto from '../components/SelectedPhoto';
import SelectPhotoButton from '../components/SelectPhotoButton';
import SelectionDrawer from '../components/SelectionDrawer';
import InlineListPicker from '../components/InlineListPicker';
import cities from '../data/cities';

export default function New({ navigation }) {
  const [selectedPhotos, setSelectedPhotos] = useState(['addButton']); // Seçilen fotoğrafların dizisi varsayılan olarak sadece buton olacak
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState(0);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const db = getFirestore(); // Firestore ve Firebase Storage bağlantılarını oluşturur
  const storage = getStorage();
  const { currentUser } = getAuth();  // Firebase Authentication üzerinden kullanıcıyı alır

  // Modal'ın görünürlüğünü true yaparak yeni resim eklemeyi başlatan fonksiyon
  const addPicture = () => {
    setModalVisible(true);
  }

  // Kamera ile resim çekmek için fonksiyon
  const takePicture = async () => {
    if (selectedPhotos.length >= 6) return; // Seçilen fotoğraf sayısı 6 ile sınırlayıp return yapıyoruz
    const { status } = await Camera.requestCameraPermissionsAsync(); // Kamera izni istenir

    // Eğer yukardan dönen status onaylanmazsa return yapıyoruz
    if (status !== 'granted') {
      return;
    }

    // // Kamerayı başlatıp fotoğraf çekme işlemini başlatır
    const result = await launchCameraAsync({
      aspect: [1, 1], // Fotoğraf en-boy oranı
      allowsEditing: true, // Düzenlemeye izin ver fotoğrafteki belli bir alanı kırparak almak için
      cameraType: CameraType.back, // Sadece arka kamera kullanılır
      mediaTypes: MediaTypeOptions.Images, // Sadece resimler için izin ver
      quality: 0.5, // Resim kalitesi 0.5 olarak ayarlanır
    })

    // Eğer kullanıcı işlemi iptal ederse fonksiyondan çıkar
    if (result.canceled) return;

    // selectedPhotos dizisinin bir kopyası newPhotos adında yeni bir diziye atanıyor. selectedPhotos'un içeriğini direkt olarak değiştirmemek için kopya bir dizi oluşturuyoruz
    let newPhotos = [...selectedPhotos];
    // splice ile newPhotos dizisinin 2. elemanından itibaren 0 eleman silinir ve result.assets[0].uri yeni çekilen fotoğrafın URI'si bu konuma eklenir. Yeni fotoğrafın butonun sağına eklenmesini sağlar
    newPhotos.splice(1, 0, result.assets[0].uri);
    setNewPhotos(newPhotos);
  };

  // Galeriden fotoğraf seçmek için kullanılan fonksiyon
  const selectFromGallery = async () => {
    if (selectedPhotos.length >= 6) return; // Seçilen fotoğraf sayısı 6 ile sınırlayıp return yapıyoruz
    const result = await launchImageLibraryAsync({ // Galeri açılır ve kullanıcıya fotoğraf seçebilir
      aspect: [1, 1], // Fotoğraf en-boy oranı
      mediaTypes: MediaTypeOptions.Images, // Sadece resimler için izin ver
      quality: 0.5, // Resim kalitesi 0.5 olarak ayarlanır
      allowsMultipleSelection: true, // Çoklu seçmeye izin verir
      selectionLimit: 6 - selectedPhotos.length // Çoklu seçimde limiti ayarlar
    })

    // Eğer kullanıcı işlemi iptal ederse fonksiyondan çıkar
    if (result.canceled) return;

    // result nesnesinde bulunan her fotoğrafın URI'sini içeren bir dizi oluşturur
    let photos = result.assets.map((val) => val.uri)

    let newPhotos = [...selectedPhotos]; // selectedPhotos dizisinin kopyası olan newPhotos oluşturulur.
    newPhotos.splice(1, 0, ...photos);  // Galeriden seçilen fotoğraflar mevcut fotoğrafların/butonun sağına eklenmesini sağlar.
    setNewPhotos(newPhotos);
  }

  // selectedPhotos dizisini günceller ve modal görünürken ve fotoğraf sayısı 6 dan fazla ise modalı gizler.
  const setNewPhotos = (photos) => {
    setSelectedPhotos(photos);
    if (modalVisible && photos.length >= 6) setModalVisible(false);
  }


  // Bu fonksiyon, belirtilen indexteki fotoğrafı seçilmiş fotoğraflar dizisinden kaldırır
  const removePicture = (index) => {
    let newPhotos = [...selectedPhotos]; // selectedPhotos dizisinin bir kopyası olan newPhotos oluşturulur
    newPhotos.splice(index, 1); // splice yöntemiyle index konumundaki fotoğraf diziden kaldırılır.
    setNewPhotos(newPhotos); // selectedPhotos dizisini günceller
  }

  // Seçilen il ve ilçenin dizideki indeksini fonksiyon ile günceller. 
  const handleCityPicker = (value, index) => {
    setSelectedCityIndex(index);
  };

  const handleDistrictPicker = (value, index) => {
    setSelectedDistrictIndex(index);
  }

  // Yükle butonuna basıldığında .alışacak fonksiyon
  const handleUpload = async () => {
    if (selectedPhotos.length <= 1 || !title || !desc || selectedCityIndex === 0) { //Boş alan kontrolü
      Alert.alert('Lütfen tüm alanları doldurun.');
      return;
    }
    try {
      setLoading(true); // loading i true yapıyoruz
      // Resimleri Firebase Storage'a yükle
      const photoURLs = [];
      for (const photo of selectedPhotos) { // Seçilen fotoğrafların her biri için bir döngü başlatır
        if (photo !== 'addButton') { // Fotoğrafın addButton olmadığını kontrol eder
          const fileName = photo.split('/').pop(); // Fotoğrafın dosya adını belirlemek için fotoğrafın yolunu parçalar ve en sondaki parçayı alır
          const fileRef = ref(storage, fileName); // Firebase Storage'da fotoğraf için bir referans oluşturur
          const response = await fetch(photo); // Fotoğrafın URL'sini kullanarak bir HTTP isteği yapar ve fotoğrafı indirir
          const blob = await response.blob(); // İndirilen fotoğraf verisini bir Blob nesnesine dönüştürür -  binary dosya veya medya verilerini işlemek
          console.log("uploading");
          await uploadBytes(fileRef, blob); // Firebase Storage'a Blob'u yükler.
          console.log("uploaded");
          const downloadURL = await getDownloadURL(fileRef); //  yüklenen dosyanın indirme URL'sini alır.
          photoURLs.push(downloadURL); // indirme URL'sini photoURLs dizisine ekler.
        }
      }

      // itemData nesnesi oluşturulur ve 
      const itemData = {
        userId: currentUser.uid,
        title: title,
        description: desc,
        city: cities[selectedCityIndex].il_adi,
        district: cities[selectedCityIndex].ilceler[selectedDistrictIndex].ilce_adi,
        photos: photoURLs,
        timestamp: serverTimestamp()
      };

      // addDoc fonksiyonu ile firestore da items collectionuna itemData nesnesini ekler
      const docRef = await addDoc(collection(db, "items"), itemData);
      // console.log("Ürün başarıyla eklendi:", docRef.id);
      Alert.alert('Tebrikler', 'Ürün başarıyla eklendi.');
      // Sayfayı yeniliyor formun boşaltılması için
      navigation.replace("Home", { screen: "Yeni" })
    } catch (error) {
      console.error('Ürün yükleme hatası:', error);
      Alert.alert('Hata', 'Ürün yüklenirken bir hatayla karşılaşıldı.');
    } finally {
      setLoading(false); // Yükleme tamamlandığında loading state'ini false olarak ayarla
    }
  };

  return (
    <TouchableWithoutFeedback disabled={loading} style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* loading true ise bir yükleme göstergesi ActivityIndicator render eder ve yükleme spinner'ı gösterir. */}
        {loading && <ActivityIndicator style={styles.activityIndicator} size="large" color="#B97AFF" />}
        <SelectionDrawer visible={modalVisible} onClose={() => { setModalVisible(false) }} options={[{ text: 'Camera', action: takePicture }, { text: 'Gallery', action: selectFromGallery }]} />

        <View style={[styles.photoContainer, { opacity: loading ? 0.4 : 1 }]}>
          <FlatList horizontal data={selectedPhotos}
            renderItem={({ item, index }) => (
              // Eğer item addButonsa seçilen fotoğraf sayısını kontrol ediyoruz. seçilen fotoğraf max ise null dönecek addButton olmayacak. ama eğer max değil hala foto ekleeyebiliyorsak selectPhotoButton dönüyoruz. 
              // Eğer item addButton değilse de SelectedPhoto dönüyoruz 
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
  contentContainer: {
    padding: 20,
    marginHorizontal: 10
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
