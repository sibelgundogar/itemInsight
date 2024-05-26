import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { onSnapshot, collection, getFirestore, doc, arrayUnion, updateDoc, Timestamp, addDoc, query, or } from 'firebase/firestore';
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
			<Stack.Screen name="MesajDetay" component={MesajDetay} options={{ headerShown: true, title: "Chat" }} />
		</Stack.Navigator>
	);
}

//Mesajlar sayfasındaki Gelen Ve Gönderilen mesaj sayfalarına geçiş için navigator
function Tabs() {
	return (
		// Tab.Navigator
		<Tab.Navigator>
			<Tab.Screen name="IncomingMessages" component={IncomingMessages} options={{ headerShown: true, title: "Gelen Mesajlar" }} />
			<Tab.Screen name="OutgoingMessages" component={OutgoingMessages} options={{ headerShown: true, title: "Gönderilen Mesajlar" }} />
		</Tab.Navigator>
	);
}


// Mesajlara tıklanınca açılan mesaj detay sayfası
function MesajDetay({ route }) {
	// TODO: canlı güncelleme ekle, onSnapshot
	const { message } = route.params;

	const [chatRef, setChatRef] = useState(message.id ? doc(db, "messages", message.id) : null);
	const [draftMessage, setDraftMessage] = useState("");
	const [localMessages, setLocalMessages] = useState(message.messages);
	const [shouldScroll, setShouldScroll] = useState(true);

	const scrollView = useRef();

	const messagesRef = collection(db, "messages");

	const title = message.itemData.title;
	const photo = message.itemData.photo;
	const dateTime = chatRef ? localMessages.at(-1).time.toDate().toLocaleString() : "New Chat";
	const isOwner = message.ownerId === auth.currentUser.uid

	const sendMessage = async () => {
		const messageObject = {
			content: draftMessage,
			isOwner: isOwner,
			time: Timestamp.now()
		}

		setLocalMessages([...localMessages, messageObject]);
		setDraftMessage("");

		if (chatRef) {
			updateDoc(chatRef, {
				messages: arrayUnion(messageObject)
			})
		} else {
			const document = await addDoc(messagesRef, {
				ownerId: message.ownerId,
				senderId: message.senderId,
				item: doc(db, "items", message.itemData.id),
				messages: [messageObject]
			})

			setChatRef(doc(db, "messages", document.id))
		}
	}

	const onScroll = (event) => {
		const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
		const isAtBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - 20;
		setShouldScroll(isAtBottom);
	}

	useEffect(() => {
		if (!chatRef) return;

		const unsubscribe = onSnapshot(chatRef, (document) => {
			const data = document.data();
			data.id = document.id;

			setLocalMessages(data.messages);
		})

		return unsubscribe;
	}, [chatRef])

	useLayoutEffect(() => {
		if (shouldScroll && scrollView.current)
			setTimeout(() => scrollView.current.scrollToEnd({ animated: false }))

	}, [localMessages])

	return (
		<View style={styles.container}>
			<View style={styles.msgContainer}>
				<Image src={photo} style={styles.image} />
				<View style={styles.textContainer}>
					<Text style={styles.headerText}>{title}</Text>
				</View>
			</View>
			<Text style={styles.detailDateText}>{dateTime}</Text>
			<ScrollView ref={scrollView} onScroll={onScroll} style={styles.detailContainer}>
				{
					localMessages.map((msg, index) => {
						return (
							<View key={index} style={{ ...styles.chatMessageBox, ...(msg.isOwner === isOwner ? styles.chatRightBox : styles.chatLeftBox) }}>
								<Text style={{ ...styles.chatMessage, ...(msg.isOwner === isOwner ? styles.chatRightMessage : styles.chatLeftMessage) }}>{msg.content}</Text>
							</View>
						)
					})
				}
			</ScrollView>


			<View style={styles.inputContainer}>
				<TextInput onChangeText={setDraftMessage} value={draftMessage} style={styles.input} placeholder="Mesajı giriniz..." />
				<TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
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
		borderColor: "#B97AFF",
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
		marginBottom: 10,
		marginHorizontal: 10,
	},
	detailDateText: {
		alignSelf: 'center'
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
		backgroundColor: "#9932FF"
	},
	chatRightBox: {
		borderBottomLeftRadius: 12,
		marginLeft: "auto",
		backgroundColor: "#B97AFF"
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
		marginBottom: 20,
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

