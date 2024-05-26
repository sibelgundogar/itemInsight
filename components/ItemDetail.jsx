import React, { useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { deleteDoc, updateDoc } from 'firebase/firestore';

const ItemDetail = ({ item, fromScreen, navigation, onDelete, onComplete }) => {
  const [activeIndex, setActiveIndex] = useState(0);

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
          onPress: onDelete, // onDelete prop'ı tetikleniyor
        },
      ],
      { cancelable: false }
    );
  };

  const handleComplete = async () => {
    try {
      onComplete(); // onComplete prop'ı tetikleniyor
      Alert.alert('Tebrikler', 'Ürünü sahibine ulaştırdınız.');
    } catch (error) {
      console.error('Ürünü güncellerken bir hata oluştu:', error);
      Alert.alert('Hata', 'Ürün güncellenirken bir hata oluştu.');
    }
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(contentOffsetX / viewSize);
    setActiveIndex(index);
  };

  return (
    <View style={styles.photoContainer}>
      {/* Görselleri gösteren ScrollView */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {item && item.photos && item.photos.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={styles.itemDetailImage}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.paginationContainer}>
        {item && item.photos && item.photos.map((_, index) => (
          <View key={index} style={[styles.dot, { opacity: index === activeIndex ? 1 : 0.3 }]} />
        ))}
      </View>
      {/* Ürün bilgileri */}
      <Text style={styles.productDetailName}>{item.title}</Text>
      <Text style={styles.productDetailLocation}>{item.city}, {item.district}</Text>
      <Text style={styles.productDetailDesc}>{item.description}</Text>

      {/* Butonlar, hangi sayfadan geldiğine göre farklılık gösterecek */}
      <View style={styles.buttonContainer}>
        {fromScreen === 'Home' && (
          <TouchableOpacity style={styles.iconButton} onPress={handleComplete}>
            <FontAwesome name="check" size={24} color="green" />
          </TouchableOpacity>
        )}
        {fromScreen === 'Profile' && (
          <>
            <TouchableOpacity style={styles.iconButton} onPress={() => console.log('Edit clicked')}>
              <FontAwesome name="edit" size={24} color="yellow" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
              <FontAwesome name="trash" size={24} color="red" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  photoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // Arka plan rengi
  },
  itemDetailImage: {
    width: 300,
    height: 200,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  paginationContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    marginHorizontal: 5,
  },
  productDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  productDetailLocation: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
  },
  productDetailDesc: {
    fontSize: 18,
    marginTop: 10,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  iconButton: {
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default ItemDetail;
