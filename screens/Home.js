
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { getFirestore, collection, getDocs, query, orderBy, getDoc, doc, where, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import Messages from './Messages';
import New from './New';
import Profile from './Profile';
import SearchModal from '../components/SearchModal';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const auth = getAuth();
const db = getFirestore();

export default function Home() {
	return (
		<Navbar />
	);
}

// Her  sayfanın altındaki navigation barın sekmeleri
function Navbar() {
	return (
		<Tab.Navigator
			initialRouteName="Main" //varsayılan olarak açılacak sayfa
			screenOptions={{
				tabBarActiveTintColor: '#B97AFF',  //aktif olan sekmenin sembolünün rengi
			}}>
			<Tab.Screen
				name="Main"
				component={HomeWrapper}
				options={{
					headerShown: false,
					tabBarLabel: 'Ana Sayfa',
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="home" color={color} size={30} />
					),
				}}
			/>
			<Tab.Screen
				name="MessagesParent"
				component={Messages}
				options={{
					// headerBackVisible: false,
					headerShown: false,
					tabBarLabel: 'Mesajlar',
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="message" color={color} size={25} />
					),
				}}
			/>
			<Tab.Screen
				name="Yeni"
				component={New}
				options={{
					tabBarLabel: 'Yeni',
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="plus" color={color} size={30} />
					),
				}}
			/>
			<Tab.Screen
				name="Profile"
				component={Profile}
				options={{
					headerBackVisible: false,
					headerShown: false,
					tabBarLabel: 'Profil',
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="account" color={color} size={30} />
					),
				}}
			/>
		</Tab.Navigator>
	);
}

// Ana sayfanın kodları
function HomeScreen({ navigation }) {
	const [items, setItems] = useState([]);
	const [refreshing, setRefreshing] = useState(false); // Sayfa yenileme durumunu izlemek için state
	const [searchText, setSearchText] = useState('');
	const [searchCity, setSearchCity] = useState('');
	const [searchDistrict, setSearchDistrict] = useState('');
	const [modalVisible, setModalVisible] = useState(false); // Arama yaparken açılan modalın visible durumu için state

	//  Firestore'dan veri çekerek listeyi yenilemek için asenkron olarak yenileme yapar.
	const refreshItems = async () => {
		// Listeyi yenileme işlemini true yapıyoruz
		setRefreshing(true);
		try {
			// Firestore'daki "items" koleksiyonuna bir referans oluşturur
			const itemsRef = collection(db, "items");
			// Firestore'dan veri çekmek için bir sorgu oluşturuyoruz. items isimli collection daki verileri timestamp alanına göre sıralar
			const q = query(itemsRef, orderBy('timestamp', 'desc'));
			// getDocs fonksiyonu sorguyu kullanarak Firestore'dan verileri asenkron olarak alır ve document değişkenine atar.
			const document = await getDocs(q);
			// Burada boş bir dizi oluşturuyoruz.
			const itemsData = [];
			// forEach ile document içindeki doc için bir döngü başlatır.
			document.forEach((doc) => {
				// doc.data() ile  her belgenin (doc) içindeki veriyi alır ve data değişkenine atar.
				const data = doc.data();
				// Matches lar ile data daki değeri kullanıcı tarafından girilen search alanındaki değerler ile eşleşmesini kontrol eder.
				const titleMatches = data.title.toLowerCase().includes(searchText.toLowerCase());
				const descriptionMatches = data.description.toLowerCase().includes(searchText.toLowerCase());
				// Şehir filtresi uygulanmadığında tüm şehirlerin eşleşmesini sağlar
				const cityMatches = searchCity ? data.city.toLowerCase().includes(searchCity.toLowerCase()) : true;
				// Tamamlanmayan ve yukaradaki filtrelerle eşleşen sonuçları seçer
				if (!data.isComplete && (titleMatches || descriptionMatches || cityMatches)) {
					// Yukarda oluşturduğumuz boş diziye bu doc daki değerler pushlanır/eklenir.
					itemsData.push({
						id: doc.id,
						title: data.title,
						description: data.description,
						city: data.city,
						district: data.district,
						photos: data.photos,
						timestamp: data.timestamp,
						userid: data.userId,
					});
				}
			});
			// setItems ile items statei itemsData dizisi ile güncellenir
			setItems(itemsData);
		} catch (error) {
			console.error('Verileri alırken bir hata oluştu:', error);
		} finally {
			setRefreshing(false);
		}
	};


	useEffect(() => {
		// Sayfa yüklendiğinde verileri ilk kez getirmesi için fonksiyonu çağırıyoruz
		refreshItems();
		// search verileri değiştiğinde useEffect yani refreshItems fonksiyonu çağrılır.
	}, [searchText, searchCity, searchDistrict]);

	// Her bir ürünü render ediyor
	const renderItem = ({ item }) => (
		// Öğeye tıklandığında o öğenin detay sayfasına yönlendirir ve item verilerini bu ekrana gönderir.
		<TouchableOpacity style={styles.itemContainer} onPress={() => navigation.navigate('Ürün Detayı', { itemDetail: item })}>
			<View style={styles.itemFrame}>
				<Image source={{ uri: item.photos[0] }} style={styles.itemImage} resizeMode="cover" />
				<Text style={styles.itemName}>{item.title}</Text>
				<Text style={styles.itemLocation}>{item.city}, {item.district}</Text>
			</View>
		</TouchableOpacity>
	);

	// Arama parametrelerini ayarlamak için kullanılır
	const handleSearch = (text, city, district) => {
		setSearchText(text);
		setSearchCity(city);
		setSearchDistrict(district);
	};

	// Arama parametrelerini temizler. Ve refreshItems fonksiyonu çağrılarak anasayfa güncellenir
	const handleClearSearch = () => {
		setSearchText('');
		setSearchCity('');
		setSearchDistrict('');
		refreshItems();
	};


	// Tüm sayfanın görünümü için return kısmı
	return (
		<View style={styles.container}>
			{/* En üstteki arama kısmı  */}
			<View style={styles.searchContainer}>
				<TouchableOpacity onPress={() => setModalVisible(true)} style={styles.searchButton}>
					<MaterialCommunityIcons name="magnify" color="#B97AFF" size={25} />
					<Text style={styles.searchText}>Bul...</Text>
				</TouchableOpacity>
				{(searchText || searchCity || searchDistrict) && (
					<TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
						<MaterialCommunityIcons name="close-circle" color="#B97AFF" size={25} />
					</TouchableOpacity>
				)}
			</View>
			{/* Anasayfada gösterilen ilanların listesi */}
			<FlatList
				data={items} // Gösterilecek veri kaynağı olarak items dizisini kullanır
				renderItem={renderItem} // Her bir öğeyi nasıl render edeceğini belirtir
				keyExtractor={(item) => item.id.toString()} //  Her bir öğeye benzersiz bir anahtar atar
				numColumns={2} // Listeyi iki sütun halinde gösterir
				refreshing={refreshing} // Sayfanın yenilenip yenilenmediğini belirtir
				onRefresh={refreshItems} // Sayfa yenileme işlemi gerçekleştiğinde çağrılacak fonksiyonu belirtir. 
			/>
			{/* Arama kısmında açılan modal */}
			<SearchModal
				visible={modalVisible} //  Modal'ın görünürlüğü
				onClose={() => setModalVisible(false)} // Modal kapatıldığında çağrılacak fonksiyon
				onSearch={handleSearch} // Arama işlemi gerçekleştirildiğinde çağrılacak fonksiyon
			/>
		</View>
	);
}

// Ürün detayı sayfası açılca geleek ekran
function ItemDetailScreen({ route, navigation }) {
	// route.params içinden itemDetail öğesini çıkarır. geçiş sırasında aktarılan ürün detaylarını içerir
	const { itemDetail } = route.params;
	// itemDetail ve itemDetail.photos varsa photos değişkenine atar yoksa boş bir dizi atar.
	const photos = itemDetail && itemDetail.photos ? itemDetail.photos : [];
	// aktif indexi tutmak için state
	const [activeIndex, setActiveIndex] = useState(0);

	// Fotoğrafların yana kaydırmalı bir şekilde görünmesi için fonksiyon
	const handleScroll = (event) => {
		const contentOffsetX = event.nativeEvent.contentOffset.x;  // Yatay kaydırma ofsetini alır
		const viewSize = event.nativeEvent.layoutMeasurement.width; // Görüntüleme alanının genişliğini alır
		const index = Math.floor(contentOffsetX / viewSize); // Kaydırılan içerik genişliğine göre aktif olan fotoğrafın indeksini hesaplar
		setActiveIndex(index); // Hesaplanan indeksi activeIndex e atar
	};

	// Mesaj gönderme butonunun fonksiyonu asenkron çalışır
	const sendMessage = async () => {
		// Firestore'daki "messages" koleksiyonuna bir referans oluşturur
		const messagesRef = collection(db, "messages");
		// Koleksiyonda item ID si detail leri gösterilen itemın id si ve gönderici şuanki aktif kullanıcı olan belgeler için bir sorgu oluşturur
		const q = query(messagesRef, where("item", "==", doc(db, "items", itemDetail.id)), where("senderId", "==", auth.currentUser.uid))
		const docs = await getDocs(q);

		// getDocs fonksiyonu sorguyu kullanarak Firestore'dan verileri alır ve ilk documenti seçer.
		if (docs.empty) {
			var data = {
				item: doc(db, "items", itemDetail.id),
				ownerId: itemDetail.userid,
				senderId: auth.currentUser.uid,
				messages: [],
			}
		} else {
			const document = docs.docs[0];
			var data = document.data();
			data.id = document.id

		}
		// doc daki değerlele message nesnesi oluşturulur
		const message = {
			id: data.id,
			messages: data.messages,
			ownerId: data.ownerId,
			senderId: data.senderId,
			itemData: {
				id: itemDetail.id,
				photo: itemDetail.photos[0],
				title: itemDetail.title,
			}
		}

		// MessagesParent ekranına yönlendirir ve MesajDetay ekranına message parametrelerini gönderir
		navigation.navigate("MessagesParent", {screen: "Messages", params:{screen:"OutgoingMessages"}});
		navigation.push("MesajDetay", {message:message});
	}

	return (
		<View style={styles.itemDetailContainer}>
			<ScrollView
				horizontal // Yatay kaydırmayı etkinleştirir
				pagingEnabled // Sayfa bazlı kaydırmayı etkinleştirir ekran boyutunda geçiş yapar
				showsHorizontalScrollIndicator={false} // Yatay kaydırma çubuğunu gizler
				onScroll={handleScroll} // Kaydırma için handleScroll fonksiyonu çağrılır
			// scrollEventThrottle={1} //  Kaydırma olaylarının ne sıklıkta ele alınacağını belirler milisaniye
			>

				{photos.map((photo, index) => ( // photos dizisini dolaşarak her bir fotoğraf için Image bileşeni oluşturur.
					<Image
						key={index} // Her bir öğe için benzersiz bir anahtar sağlar
						source={{ uri: photo }} // Görüntü kaynağını belirler
						style={{ ...styles.itemDetailImage }}
						resizeMode="cover" //  Görüntünün, alanı dolduracak şekilde kırpılmasını sağlar.
					/>
				))}
			</ScrollView>
			<View style={styles.paginationContainer}>
				{photos.map((photos, index) => ( // photos dizisini dolaşarak her bir fotoğraf için bir nokta oluşturur.
					<View key={index}
						style={[styles.dot, { opacity: index === activeIndex ? 1 : 0.3 }]} /> // index activeIndex ise opaklığı 0.3 yapar
				))}
			</View>
			<Text style={styles.itemDetailName}>{itemDetail.title}</Text>
			<Text style={styles.itemDetailLocation}>{itemDetail.city}, {itemDetail.district}</Text>
			<Text style={styles.itemDetailDesc}>{itemDetail.description}</Text>
			<TouchableOpacity style={styles.messageSendButton}>
				<Text style={styles.messageSendButtonText} onPress={sendMessage}>Mesaj Gönder</Text>
			</TouchableOpacity>
		</View>
	);
}

//Ana sayfa ve Ürün detay sayfası arasında stack screen oluşturan fonksiyon
function HomeWrapper() {
	return (
		<Stack.Navigator>
			<Stack.Screen name="Ana Sayfa" component={HomeScreen} options={{ headerShown: false }} />
			<Stack.Screen name="Ürün Detayı" component={ItemDetailScreen} />
		</Stack.Navigator>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 10,
		marginTop: 20,
	},
	itemContainer: {
		margin: 5,
	},
	itemFrame: {
		// flex: 1,
		alignItems: 'center',
		width: 173,
		borderColor: '#B97AFF',
		borderWidth: 2,
		borderRadius: 15,
		padding: 10,
	},
	itemImage: {
		width: '100%',
		height: 120,
		borderRadius: 5
	},
	itemName: {
		fontSize: 16,
		fontWeight: 'bold',
		marginTop: 10,
	},
	itemLocation: {
		fontSize: 14,
		color: '#6700A9',
		marginTop: 5,
		marginHorizontal: -10
	},
	itemDetailContainer: {
		marginVertical: 20,
	},
	itemDetailImage: {
		alignSelf: 'center',
		width: 370,
		height: 370,
		borderRadius: 5,
		marginBottom: 15,
		marginHorizontal: 10
	},
	itemDetailName: {
		marginLeft: 20,
		fontSize: 25,
		fontWeight: 'bold',
		marginTop: 10,
	},
	itemDetailLocation: {
		marginLeft: 20,
		fontSize: 16,
		color: '#6700A9',
		marginTop: 5,
	},
	itemDetailDesc: {
		marginLeft: 20,
		fontSize: 17,
		marginTop: 5,
	},
	messageSendButton: {
		marginTop: 50,
		backgroundColor: '#B97AFF',
		padding: 10,
		borderRadius: 5,
		marginLeft: 230,
		marginRight: 20,
	},
	messageSendButtonText: {
		color: 'white',
		textAlign: 'center',
		fontWeight: 'bold',
	},
	paginationContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 10,
		marginBottom: 20,
	},
	dot: {
		height: 9,
		width: 9,
		borderRadius: 5,
		backgroundColor: '#B97AFF',
		marginHorizontal: 5,
	},
	searchContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 10,
		marginHorizontal: 10,
		marginBottom: 10,
		marginTop: 15,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#B97AFF',
	},
	searchbar: {
		borderRadius: 4,
		width: '100%',
		backgroundColor: '#bdc6cf',
	},
	searchButton: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	searchText: {
		marginLeft: 10,
		color: '#888',
	},
	clearButton: {
		marginLeft: 10,
	},
});


