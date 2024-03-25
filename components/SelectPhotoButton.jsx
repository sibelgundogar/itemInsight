import { Text, StyleSheet, TouchableOpacity, View } from "react-native";

export default function SelectPhotoButton({onPress}) {
		
	return (
		<TouchableOpacity style={styles.photoButton} onPress={onPress}>
			<Text style={styles.buttonText}>+</Text>
		</TouchableOpacity>
	)
}

const styles = StyleSheet.create({
	photoButton: {
		marginVertical: 10,
		marginHorizontal: 4,
		borderWidth: 2,
		borderColor: '#B97AFF',
		backgroundColor: '#DBB9EC',
		padding: 10,
		borderRadius: 5,
		paddingTop: 0,
		width: 100,
		height: 100,
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center'
	},
	buttonText: {
		fontSize: 75,
        textAlign: 'center',
		fontWeight: 'bold',
		color: '#0008'
	}
});