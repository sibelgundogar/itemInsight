import React from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';

export default function Splash({ navigation }) {
    // Animasyon için animasyon değeri
    const slideAnim = useRef(new Animated.Value(0)).current;

    // Resmin yüklenip yüklenmediğini kontrol etmek için
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // Animasyonu başlatmadan önce resmin yüklenip yüklenmediğini kontrol ediyor
        if (!loaded) {
            return;
        }

        // Animated.timing kullanarak aşağı kaydırma animasyonunu oluşturuyor
        const slideDown = Animated.timing(slideAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
        });

        // Animasyonunu başlat
        slideDown.start(() => {
            // Animasyon tamamlandıktan sonra Sign İn sayfasını açıyor
            setTimeout(() => {
                navigation.replace('Signin');
            }, 500);
        });
    }, [navigation, slideAnim, loaded]); // Animasyonun başlaması için loaded true olması lazım

    // loaded state ini true yapıyor
    const loadimage = () => {
        setTimeout(setLoaded, 300, true);
    };

    return (
        <View style={styles.container}>
            <Image source={require('../images/bg_1.jpg')} style={styles.backgroundImage} onLoad={loadimage} />
            {!loaded ? null : ( // Resim yüklendiğinde içeriği render etmak için
                <>
                    <View style={styles.headerContainer}>
                        <Text style={styles.headerText}>Item Insight</Text>
                    </View>
                    <Animated.View //animasyon ile resmin aşağıya doğru kayar
                        style={{
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [-200, 0],
                                    }),
                                },
                            ],
                        }}>
                        <Image source={require('../images/logo.png')} style={styles.logoImage} resizeMode="center"
                        />
                    </Animated.View>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContainer: {
        resizeMode: 'cover',
        position: 'absolute',
        backgroundColor: '#ECD2F7',
        zIndex: 1,
    },
    headerText: {
        fontSize: 40,
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: 145,
    },
    logoImage: {
        width: 200,
        height: 200,
        marginTop: 400,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
});
