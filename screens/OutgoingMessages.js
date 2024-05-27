import { View, StyleSheet, TouchableOpacity, Image, Text } from 'react-native';
import { getAuth } from 'firebase/auth';
import { query, collection, where, getFirestore, getDocs, getDoc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect } from 'react';

const db = getFirestore()

//Gönderilen mesajlar sayfası
export function OutgoingMessages({ navigation }) {
    const [messages, setMessages] = useState([]);
    const auth = getAuth();

    //bir mesaja tıkladığında, o mesajın detayları içeren  mesaj detay sayfasına yönlendirmek için kullanılır parametreleri onPress den geliyor
    const navigateToDetails = (message) => { navigation.navigate('MesajDetay', { message }) };

    useEffect(() => {
        const messagesRef = collection(db, "messages");
        const q = query(messagesRef, where("senderId", "==", auth.currentUser.uid)); // ürünün sahibi biz değilsek gönderen bizsek

        const unsubscribe = onSnapshot(q, async (querySnapshot) => { // Firestore'dan gerçek zamanlı güncellemeleri dinlemek için onSnapShot kullandık
            const allMessages = [];
            const docs = querySnapshot.docs; // Sorgu sonuçlarının belgeleri alınır.
			for (const document of docs) { // Her belge için döngü oluşturulur. 
				const data = document.data();  // Belgenin verileri alınır.
				data.id = document.id; // Belgenin ID'si data nesnesine eklenir.

				const item = (await getDoc(data.item)).data();  // Mesajın bağlı olduğu öğenin verileri alınır

				const message = { // Mesaj verileri bir nesneye toplanır.
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

                allMessages.push(message); // allMessages dizisine bu mesaj eklenir.
            }

            setMessages(allMessages); // Tüm mesajlar setMessages fonksiyonuyla bileşenin state'ine atanır.
        })

        return unsubscribe; // Bileşen unmount olduğunda aboneliği iptal eder.
    }, [])

    return (
        <View style={styles.container}>
            {
                messages.map((message, index) => {
                    const title = message.itemData.title;
                    const lastMessage = message.messages[message.messages.length - 1];
                    const photo = message.itemData.photo;
                    const dateTime = lastMessage.time.toDate().toLocaleString();
                    return (
                        <TouchableOpacity key={index} style={styles.msgContainer}
                            onPress={() =>  //tıklanınca navigateToDetails çalışır ve parametreler gönderilir
                                navigateToDetails(
                                    message
                                )
                            }>

                            <Image src={photo} style={styles.image} />
                            <View style={styles.textContainer}>
                                <Text style={styles.headerText}>{title}</Text>
                                <Text style={styles.msgText}>{lastMessage.content}</Text>
                            </View>
                            <Text style={styles.dateText}>{dateTime}</Text>
                        </TouchableOpacity>
                    )
                })
            }
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
    }
});

