import { useEffect } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { onSnapshot, collection, getFirestore } from 'firebase/firestore';
import { IncomingMessages } from './IncomingMessages';
import { OutgoingMessages } from './OutgoingMessages';


// useEffect kullan
// onsnapshot ile yeni mesaj gelince tetikleme kısmını yaparız
// 

const db = getFirestore();

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

//Mesajlar ve mesaj detayı sayfasının stack navigatoru
export default function Messages() {
  useEffect(() => {
    // console.log("Subscribed")
    // const unsubscribe = onSnapshot(collection(db, "messages"), (snapshot) => {
    //   const source = snapshot.metadata.hasPendingWrites ? "Local" : "Server";
    // })

    // return () => {
    //   console.log("Unsubscribed")
    //   unsubscribe()
    // }
  }, [])

  return (
    <Stack.Navigator>
      <Stack.Screen name="Messages" component={Tabs} options={{ headerShown: true, title: "Mesajlar" }} />
      <Stack.Screen name="MesajDetay" component={MesajDetay} options={{ headerShown: true }} />
    </Stack.Navigator>
  );
}

//Mesajlar sayfasındaki Gelen Ve Gönderilen mesaj sayfalarına geçiş için navigator
function Tabs() {
  return (
    // Tab.Navigator
    <Tab.Navigator>
      <Tab.Screen name="Gelen Mesajlar" component={IncomingMessages} />
      <Tab.Screen name="Gönderilen Mesajlar" component={OutgoingMessages} />
    </Tab.Navigator>
  );
}





// Mesajlara tıklanınca açılan mesaj detay sayfası
function MesajDetay({ route }) {
  const { message } = route.params;
  const title = message._item.title;
  const lastMessage = message.messages[0];
  const photo = message._item.photos[0];
  const dateTime = lastMessage.time.toDate().toLocaleString();

  return (
    <View style={messagesStyles.container}>
      <View style={messagesStyles.msgContainer}>
        <Image src={photo} style={messagesStyles.image} />
        <View style={messagesStyles.textContainer}>
          <Text style={messagesStyles.headerText}>{title}</Text>
        </View>
      </View>
      <Text style={messagesStyles.detailDateText}>{dateTime}</Text>
      <ScrollView style={messagesStyles.detailContainer}>
        {
          message.messages.map((msg, index) => {
            return (
              <View style={msg.isOwner?messagesStyles.chatRight:messagesStyles.chatLeft}>
                <Text style={messagesStyles.detailMsgText}>{msg.content}</Text>
              </View>
            )
          })
        }
      </ScrollView>


      <View style={messagesStyles.inputContainer}>
        <TextInput style={messagesStyles.input} placeholder="Mesajı giriniz..." />
        <TouchableOpacity style={messagesStyles.sendButton}>
          <FontAwesome name="send" size={24} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );
}





export const messagesStyles = StyleSheet.create({
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
  chatLeft: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 7,
    borderTopEndRadius: 12,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 12,
  },
  chatRight: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    padding: 7,
    borderTopEndRadius: 12,
    borderBottomLeftRadius: 12,
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

