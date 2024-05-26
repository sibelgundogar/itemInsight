import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { onSnapshot, collection, getFirestore, doc, arrayUnion, updateDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { IncomingMessages } from './IncomingMessages';
import { OutgoingMessages } from './OutgoingMessages';


const db = getFirestore();
const auth = getAuth();

const Tab = createMaterialTopTabNavigator();
const Stack = createStackNavigator();

//Mesajlar ve mesaj detayı sayfasının stack navigatoru
export default function Messages() {
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
	// TODO: canlı güncelleme ekle, onSnapshot
	const { message } = route.params;

	useEffect(() => {
		const unsubscribe = onSnapshot(doc(db, "messages", message._id), (doc) => {
			setLocalMessages(doc.data().messages);
			scrollView.current.scrollToEnd({animated: true})
		})

		return () => {
			unsubscribe()
		}
	}, [])

	const chatRef = doc(db, "messages", message._id);

	const title = message._item.title;
	const lastMessage = message.messages[message.messages.length - 1];
	const photo = message._item.photos[0];
	const dateTime = lastMessage.time.toDate().toLocaleString();

	const [draftMessage, setDraftMessage] = useState("");
	const [localMessages, setLocalMessages] = useState(message.messages);

	const scrollView = useRef();

	const amIOwner = message.ownerId === auth.currentUser.uid

	const sendMessage = () => {
		const messageObject = {
			content: draftMessage,
			isOwner: amIOwner,
			time: Timestamp.now()
		}

		setLocalMessages([...localMessages, messageObject]);
		setDraftMessage("");

		updateDoc(chatRef, {
			messages: arrayUnion(messageObject)
		})
	}

	return (
		<View style={messagesStyles.container}>
			<View style={messagesStyles.msgContainer}>
				<Image src={photo} style={messagesStyles.image} />
				<View style={messagesStyles.textContainer}>
					<Text style={messagesStyles.headerText}>{title}</Text>
				</View>
			</View>
			<Text style={messagesStyles.detailDateText}>{dateTime}</Text>
			<ScrollView ref={scrollView} style={messagesStyles.detailContainer}>
				{
					localMessages.map((msg, index) => {
						return (
							<View key={index} style={{ ...messagesStyles.chatMessageBox, ...(msg.isOwner === amIOwner ? messagesStyles.chatRightBox : messagesStyles.chatLeftBox) }}>
								<Text style={{ ...messagesStyles.chatMessage, ...(msg.isOwner === amIOwner ? messagesStyles.chatRightMessage : messagesStyles.chatLeftMessage) }}>{msg.content}</Text>
							</View>
						)
					})
				}
			</ScrollView>


			<View style={messagesStyles.inputContainer}>
				<TextInput onChangeText={setDraftMessage} value={draftMessage} style={messagesStyles.input} placeholder="Mesajı giriniz..." />
				<TouchableOpacity style={messagesStyles.sendButton} onPress={sendMessage}>
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
	chatMessageBox: {
		marginHorizontal: 10,
		borderWidth: 1,
		borderColor: 'gray',
		padding: 7,
		borderTopEndRadius: 12,
		borderTopLeftRadius: 12,
		marginVertical: 4,
		maxWidth: "90%"
	},
	chatLeftBox: {
		borderBottomRightRadius: 12,
		marginRight: "auto",
		backgroundColor: "#666"
	},
	chatRightBox: {
		borderBottomLeftRadius: 12,
		marginLeft: "auto",
		backgroundColor: "#a2d"
	},
	chatMessage: {

	},
	chatLeftMessage: {
		color: "#fff"
	},
	chatRightMessage: {
		textAlign: "right",
		color: "#fff"
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

