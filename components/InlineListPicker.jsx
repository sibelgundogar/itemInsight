import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// InlineListPicker fonksiyon bileşeni tanımlıyor ve items, onSelect, label, renderItemLabel adlı props'ları alıyor.
export default function InlineListPicker({ items = [], onSelect, label, renderItemLabel }) {
    const [pickerVisible, setPickerVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState(0);
    const [currentValue, setCurrentValue] = useState(0);
    const correctedValue = currentValue < items.length ? currentValue : 0;  // correctedValue, currentValue items dizisinden küçükse currentValue olur, değilse 0 olur.

    const selectAndClosePicker = () => {
        setSelectedValue(currentValue);
        setPickerVisible(false);
        onSelect(items[currentValue], currentValue); // onSelect callback fonksiyonunu çağırarak seçilen değeri ve indeksini gönderiyor.
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
        // useEffect hook'unu kullanarak items prop'u değiştiğinde çalışacak bir efekt tanımlıyor.
        setCurrentValue(0);
        setSelectedValue(0);
    }, [items]); // Bu efekt, items prop'u değiştiğinde çalışır. 

    return (
        <View>
            <Text style={styles.inputText}>{label}</Text>
            <View style={styles.inputLocation}>
                <TouchableOpacity style={styles.pickerButton} onPress={pickerVisible ? selectAndClosePicker : openPicker}>
                    <Text>{renderItemLabel(items[correctedValue], correctedValue)}</Text>
                </TouchableOpacity>
            </View>

            {pickerVisible && (
                <View style={styles.pickerContainer}>
                    <View style={styles.pickerDoneContainer}>
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
                                <Picker.Item key={index} label={renderItemLabel(value, index)} value={index} />
                            )
                        })}
                    </Picker>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    inputText: {
        fontSize: 15,
        marginVertical: 10,
    },
    inputLocation: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 10,
        marginBottom: 20,
    },
    pickerButton: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        padding: 10
    },
    pickerContainer: {
        backgroundColor: '#000000012',
        borderBottomStartRadius: 15,
        borderBottomEndRadius: 15,
    },
    pickerDoneContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
    },
    pickerDoneText: {
        color: '#B97AFF',
        fontWeight: '700',
        fontSize: 18
    },
});
