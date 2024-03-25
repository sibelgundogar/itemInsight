import { View, Text, Modal, StyleSheet, TouchableWithoutFeedback, TouchableHighlight } from "react-native";
export default function SelectionDrawer({ visible, onClose, options }) {

    return (
        <View style={styles.container}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            {
                                options.map(({ text, action }, index) => {
                                    return (
                                        <TouchableHighlight key={index} underlayColor='#0003' style={styles.option} onPress={action}>
                                            <Text style={styles.option}>{text}</Text>
                                        </TouchableHighlight>
                                    )
                                })
                            }

                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );

}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    button: {
        backgroundColor: 'blue',
        padding: 10,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
        fontSize: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        width: '100%',
        paddingVertical: 10,
        alignItems: 'center',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    option: {
        textAlign: 'center',
        fontSize: 20,
        paddingVertical: 10,
        width: '100%',

    },
});


