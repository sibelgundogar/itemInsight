import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';

export default function New() {
  const [selected, setSelected] = React.useState('');

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
      <View style={styles.photoContainer}>
        <TouchableOpacity style={styles.photoButton}>
          <Text style={styles.buttonText}>Fotoğraf Ekle</Text>
        </TouchableOpacity>
      </View>

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
  },
  photoButton: {
    alignSelf: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#B97AFF',
    marginBottom: 20,
    backgroundColor: '#DBB9EC',
    padding: 10,
    borderRadius: 5,
    width: 120,
  },
  buttonText: {
    textAlign: 'center',
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


