import React, { useState } from 'react';
import { View, Modal, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import InlineListPicker from '../components/InlineListPicker';
import cities from '../data/cities';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default SearchModal = ({ visible, onClose, onSearch }) => {
  const [searchText, setSearchText] = useState('');
  const [selectedCityIndex, setSelectedCityIndex] = useState(0);
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState(0);

  const handleSearch = () => {
    const searchCity = cities[selectedCityIndex].il_adi;
    const searchDistrict = cities[selectedCityIndex].ilceler[selectedDistrictIndex];
    onSearch(searchText, searchCity, searchDistrict);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ürün Ara"
            placeholderTextColor="#888"
            value={searchText}
            onChangeText={(text) => setSearchText(text)}
          />
          <InlineListPicker
            label="Şehir Seçin"
            items={cities}
            onSelect={(value, index) => setSelectedCityIndex(index)}
            renderItemLabel={(value, index) => value.il_adi}
          />
          <InlineListPicker
            label="İlçe Seçin"
            items={cities[selectedCityIndex]?.ilceler || []}
            onSelect={(value, index) => setSelectedDistrictIndex(index)}
            renderItemLabel={(value, index) => value.ilce_adi}
            disabled={!selectedCityIndex}
          />
          <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.searchButton} onPress={onClose}>
              <Text style={styles.searchButtonText}>Kapat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Ara</Text>
            </TouchableOpacity>
            
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'top',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    marginVertical: 45,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  searchButton: {
    flex: 1,
    backgroundColor: '#B97AFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});


