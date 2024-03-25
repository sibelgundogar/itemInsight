import { StyleSheet, View, Image, TouchableOpacity, Text } from "react-native";

import { FontAwesome } from '@expo/vector-icons'

export default function SelectedPhoto({ onDelete, src }) {
	return (
		<View style={styles.photoButton}>
			<TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
				<FontAwesome name="trash" size={16} color="white" />
			</TouchableOpacity>
			<Image style={styles.photo} src={src} width={100} height={100} />
		</View>
	)
}

const styles = StyleSheet.create({
	photoButton: {
		marginVertical: 10,
		marginHorizontal: 4,
		borderWidth: 2,
		borderColor: '#B97AFF',
		backgroundColor: '#DBB9EC',
		borderRadius: 5,
		width: 100,
		height: 100,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	photo: {
		width: '100%',
		height: '100%'
	},
	deleteButton: {
		position: 'absolute',
		top: 0,
		right: 0,
		width: 25,
		height: 25,
		backgroundColor: '#f002',
		zIndex: 2,
		margin: 3,
		borderRadius: 50,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	deleteText: {
		alignSelf: 'stretch',
		textAlign: 'center',
		fontSize: 30,
		color: '#fffa'
	}
});