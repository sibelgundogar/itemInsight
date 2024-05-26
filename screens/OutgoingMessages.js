import { View, TouchableOpacity, Image, Text } from 'react-native';
import { messagesStyles } from './Messages';
import { getAuth } from 'firebase/auth';
import { query, collection, where, getFirestore, getDocs, getDoc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';

const db = getFirestore()

//Gönderilen mesajlar sayfası
export function OutgoingMessages({ navigation }) {
    const [messages, setMessages] = useState([]);

    const auth = getAuth();
    //bir mesaja tıkladığında, o mesajın detayları içeren  mesaj detay sayfasına yönlendirmek için kullanılır parametreleri onPress den geliyor
    const navigateToDetails = (message) => {
        navigation.navigate('MesajDetay', { message });
    };

    useEffect(() => {
		const messagesRef = collection(db, "messages");
		const q = query(messagesRef, where("senderId", "==", auth.currentUser.uid));

		const unsubscribe = onSnapshot(q, async (querySnapshot) => {
			const allMessages = [];
			const docs = querySnapshot.docs;
			for (const document of docs) {
				const data = document.data();
				data.id = document.id;

				const item = (await getDoc(data.item)).data();

				const message = {
					id: data.id,
					messages: data.messages,
					ownerId: data.ownerId,
					senderId: data.senderId,
					itemData: {
						id: data.item.id,
						photo: item.photos[0],
						title: item.title,
					}
				}

				allMessages.push(message);
			}

			setMessages(allMessages);
		})

		return unsubscribe;
	}, [])

    return (
        <View style={messagesStyles.container}>
            {
                messages.map((message, index) => {
                    const title = message.itemData.title;
                    const lastMessage = message.messages[message.messages.length - 1];
                    const photo = message.itemData.photo;
                    const dateTime = lastMessage.time.toDate().toLocaleString();
                    return (
                        <TouchableOpacity key={index} style={messagesStyles.msgContainer}
                            onPress={() =>  //tıklanınca navigateToDetails çalışır ve parametreler gönderilir
                                navigateToDetails(
                                    message
                                )
                            }>

                            <Image src={photo} style={messagesStyles.image} />
                            <View style={messagesStyles.textContainer}>
                                <Text style={messagesStyles.headerText}>{title}</Text>
                                <Text style={messagesStyles.msgText}>{lastMessage.content}</Text>
                            </View>
                            <Text style={messagesStyles.dateText}>{dateTime}</Text>
                        </TouchableOpacity>
                    )
                })
            }
        </View>
    );
}