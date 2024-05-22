import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { firebaseAuth } from '../firebase';

export default function SignUp({ navigation }) {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (username === '' || email === '' || password === '') {
            Alert.alert('Boş Alanlar', 'Lütfen email ve şifre alanlarını doldurunuz.');
            return;
        }

        setLoading(true);
        const auth = firebaseAuth;
        try {
            const response = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(response.user, { displayName: username });
            // console.log(response);
            navigation.replace('Home');
        } catch (error) {
            setLoading(false);
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Hata', 'Bu e-posta adresi zaten kullanımda.');
            } else {
                Alert.alert('Hata', 'Kayıt işlemi sırasında bir hata oluştu.');
                // console.log(error);
            }
        }
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior='height'>
            <Image source={require('../images/bg_2.jpg')} style={styles.backgroundImage} />
            <Text style={styles.headerText}>KAYIT OL</Text>
            <TextInput style={styles.textinput} placeholder='Kullanıcı Adı' value={username} onChangeText={(text) => setUsername(text)}/>
            <TextInput style={styles.textinput} placeholder='E-mail' value={email} onChangeText={(text) => setEmail(text)}/>
            <TextInput style={styles.textinput} placeholder='Şifre' value={password} onChangeText={(text) => setPassword(text)} secureTextEntry/>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Kayıt Ol</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.smallText}> Hesabın varsa giriş yapabilirsin !</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Signin')}>
                <Text style={styles.buttonText}>Giriş Yap</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#B97AFF',
    },
    textinput: {
        borderBottomWidth: 1,
        borderColor: 'gray',
        width: 250,
        height: 40,
        marginTop: 10,
    },
    button: {
        width: 250,
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 4,
        backgroundColor: '#B97AFF',
        marginTop: 10,
        marginBottom: 10,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    smallText: {
        fontSize: 12,
        color: 'gray',
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
});
