import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, TextInput } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

//Mesajlar ve mesaj detayı sayfasının stack navigatoru
export default function Messages() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Mesajlar" component={Tabs} options={{ headerShown: true }} />
      <Stack.Screen name="MesajDetay" component={MesajDetay} options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}

//Mesajlar sayfasındaki Gelen Ve Gönderilen mesaj sayfalarına geçiş için navigator
function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Gelen Mesajlar" component={Inbox} />
      <Tab.Screen name="Gönderilen Mesajlar" component={Sent} />
    </Tab.Navigator>
  );
}

// Gelen Mesajlar sayfası 
function Inbox({ navigation }) {
  //bir mesaja tıkladığında, o mesajın detayları içeren  mesaj detay sayfasına yönlendirmek için kullanılır parametreleri onPress den geliyor
  const navigateToDetails = (headerText, msgText, dateText, image) => {
    navigation.navigate('MesajDetay', { headerText, msgText, dateText, image });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.msgContainer}
        onPress={() =>  //tıklanınca navigateToDetails çalışır ve parametreler gönderilir
          navigateToDetails(
            'Cüzdan',
            'Merhaba, cüzdan bana ait...',
            '22.12.24',
            require('../images/cuzdan.jpg')
          )
        }>

        <Image source={require('../images/cuzdan.jpg')} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Cüzdan</Text>
          <Text style={styles.msgText}>Merhaba, cüzdan bana ait...</Text>
        </View>
        <Text style={styles.dateText}>22.12.24</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.msgContainer}
        onPress={() =>
          navigateToDetails(
            'Kolye',
            'İyi günler belediyede çalışıyorum kolye bana ait mesajıma dönüş yapar mısınız?',
            '10.12.24',
            require('../images/kolye.jpg')
          )
        }>
        <Image source={require('../images/kolye.jpg')} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Kolye</Text>
          <Text style={styles.msgText}> İyi günler belediyede çalışıyorum kolye bana ait mesajıma dönüş yapar mısınız? </Text>
        </View>
        <Text style={styles.dateText}>10.12.24</Text>
      </TouchableOpacity>
    </View>
  );
}

//Gönderilen mesajlar sayfası
function Sent({ navigation }) {
  //bir mesaja tıkladığında, o mesajın detayları içeren  mesaj detay sayfasına yönlendirmek için kullanılır parametreleri onPress den geliyor
  const navigateToDetails = (headerText, msgText, dateText, image) => {
    navigation.navigate('MesajDetay', { headerText, msgText, dateText, image });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.msgContainer}
        onPress={() =>  //tıklanınca navigateToDetails çalışır ve parametreler gönderilir
          navigateToDetails(
            'Kulaklık',
            'Merhaba, kulaklık bana ait, nereden alabilirim? Telefonuma otomatik eşleşecektir.',
            '11.11.24',
            require('../images/kulaklik.jpg')
          )
        }>

        <Image source={require('../images/kulaklik.jpg')} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>Kulaklık</Text>
          <Text style={styles.msgText}> Merhaba, kulaklık bana ait, nereden alabilirim? Telefonuma otomatik eşleşecektir. </Text>
        </View>
        <Text style={styles.dateText}>11.11.24</Text>
      </TouchableOpacity>
    </View>
  );
}

// Mesajlara tıklanınca açılan mesaj detay sayfası
function MesajDetay({ route }) {
  const { headerText, msgText, dateText, image } = route.params;
  return (
    <View style={styles.container}>
      <View style={styles.msgContainer}>
        <Image source={image} style={styles.image} />
        <View style={styles.textContainer}>
          <Text style={styles.headerText}>{headerText}</Text>
        </View>
      </View>

      <View style={styles.detailContainer}>
        <Text style={styles.detailDateText}>{dateText}</Text>
        <View style={styles.detailMsgContainer}>
          <Text style={styles.detailMsgText}>{msgText}</Text>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Mesajı giriniz..." />
        <TouchableOpacity style={styles.sendButton}>
          <FontAwesome name="send" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  msgContainer: {
    alignSelf: 'center',
    width: '95%',
    height: 100,
    borderWidth: 2,
    borderColor: 'black',
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10,
    marginTop: 20,
  },
  image: {
    alignSelf: 'center',
    width: 80,
    height: 80,
    marginRight: 10,
  },
  textContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  msgText: {
    fontSize: 14,
  },
  dateText: {
    marginTop: 10,
    fontSize: 12,
    alignSelf: 'flex-end',
  },
  detailContainer: {
    flex: 1,
    marginVertical: 20,
    marginHorizontal: 10,
  },
  detailDateText: {
    alignSelf: 'center',
  },
  detailMsgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 7,
    borderTopEndRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  detailMsgText: {
    fontSize: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    alignSelf: 'center',
  },
  input: {
    width: '82%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    marginRight: 7,
  },
  sendButton: {
    backgroundColor: 'none',
    alignSelf: 'center'
  }
});

