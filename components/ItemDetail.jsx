import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function DetailScreen({ route }) {
  const { item, isProfileScreen } = route.params;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const viewSize = event.nativeEvent.layoutMeasurement.width;
    const index = Math.floor(contentOffsetX / viewSize);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {item.photos.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      <View style={styles.paginationContainer}>
        {item.photos.map((_, index) => (
          <View key={index} style={[styles.dot, { opacity: index === activeIndex ? 1 : 0.3 }]} />
        ))}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.location}>{item.city}, {item.district}</Text>
      <Text style={styles.description}>{item.description}</Text>
      {isProfileScreen ? (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button}>
            <FontAwesome name="edit" size={24} color="yellow" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <FontAwesome name="trash" size={24} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <FontAwesome name="check" size={24} color="green" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Mesaj Gönder</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  image: {
    width: 370,
    height: 370,
    borderRadius: 5,
    marginBottom: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#B97AFF',
    marginHorizontal: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  location: {
    fontSize: 16,
    color: '#6700A9',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendButton: {
    backgroundColor: '#B97AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
