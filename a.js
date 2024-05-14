// Profil fotoğrafını seçme işlemi
const selectProfileImage = async () => {
  try {
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

    if (!result.cancelled && result.assets.length > 0) {
      const firstPhoto = result.assets[0];
      console.log('Seçilen fotoğraf URI:', firstPhoto.uri); // Ekledim: Seçilen fotoğrafın URI'sini konsola yazdır
      uploadProfileImage(firstPhoto.uri);
    } else {
      console.log('Fotoğraf seçilmedi veya seçim işlemi iptal edildi.');
    }
  } catch (error) {
    console.error('Profil resmi seçilirken bir hata oluştu:', error); // Ekledim: Hata durumunda konsola hata mesajını yazdır
    Alert.alert('Profil resmi seçilirken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

// Profil fotoğrafını Firebase Storage'a yükleme işlemi
const uploadProfileImage = async (uri) => {
  try {
    console.log('Profil fotoğrafı yükleme işlemi başlatıldı. Fotoğraf URI:', uri); // Ekledim: Yükleme işlemi başlatıldığında konsola yazdır
    setLoading(true); // Ekledim: Yükleme işlemi başladığında loading state'ini true yap
       const user = firebaseAuth.currentUser;
       const fileName = `profile_images/${user.uid}`;
       const storageRef = ref(storage, fileName);
    const contentType = 'image/jpeg'; // veya 'image/png' gibi uygun bir MIME türü
await uploadBytes(storageRef, { contentType });  // Değiştirildi: fetch işlemi kaldırıldı, uri doğrudan yükleme işlemine verildi
    const downloadURL = await getDownloadURL(storageRef);
    await updateProfile(user, { photoURL: downloadURL });
    setProfilePhoto(downloadURL);
    setLoading(false); // Ekledim: Yükleme işlemi tamamlandığında loading state'ini false yap
    console.log('Profil fotoğrafı başarıyla yüklendi. URL:', downloadURL); // Ekledim: Başarıyla yüklendiğinde konsola URL'yi yazdır
  } catch (error) {
    console.error('Profil resmi yüklenirken bir hata oluştu:', error); // Ekledim: Hata durumunda konsola hata mesajını yazdır
    setLoading(false); // Ekledim: Hata durumunda loading state'ini false yap
    Alert.alert('Hata', 'Profil resmi yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
  }
};

