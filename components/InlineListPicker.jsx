import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function InlineListPicker({ items = [], onSelect, label, renderItemLabel }) {
    const [pickerVisible, setPickerVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState(0);
    const [currentValue, setCurrentValue] = useState(0);

    const selectAndClosePicker = () => {
        setSelectedValue(currentValue);
        setPickerVisible(false);
        onSelect(items[currentValue], currentValue);
    };

    const openPicker = () => {
        setPickerVisible(true);
    };

    const cancelAndClosePicker = () => {
        setCurrentValue(selectedValue);
        setPickerVisible(false);
    };

    const handleValueChange = (value, index) => {
        setCurrentValue(value);
    };

    useEffect(() => {
        setCurrentValue(0);
        setSelectedValue(0);
    }, [items])

    return (
        <View>
            <Text style={styles.inputText}>{label}</Text>

            <View style={styles.inputCity}>
                <TouchableOpacity style={styles.pickerButton} onPress={pickerVisible ? selectAndClosePicker : openPicker}>
                    <Text>{renderItemLabel(items[currentValue], currentValue)}</Text>
                </TouchableOpacity>
            </View>


            {pickerVisible && (
                <View style={styles.pickerWrapper}>
                    <View style={styles.pickerDoneWrapper}>
                        <TouchableOpacity onPress={cancelAndClosePicker}>
                            <Text style={styles.pickerDoneText}>İptal</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={selectAndClosePicker}>
                            <Text style={styles.pickerDoneText}>Tamam</Text>
                        </TouchableOpacity>
                    </View>

                    <Picker selectedValue={currentValue} onValueChange={handleValueChange} mode='dropdown' >
                        {items.map((value, index) => {
                            return (
                                <Picker.Item key={index} label={renderItemLabel(value, index)} value={index}  />
                            )
                        })}
                    </Picker>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    inputCity: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
    },
    inputText: {
        fontSize: 15,
        marginVertical: 10,
    },
    pickerDoneText: {
        color: '#B97AFF',
        fontWeight: '700',
        fontSize: 18
    },
    pickerDoneWrapper: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
    },
    pickerWrapper: {
        backgroundColor: '#000000012',
        borderBottomStartRadius: 15,
        borderBottomEndRadius: 15,
    },
    pickerButton: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: 10
    }
});