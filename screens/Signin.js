import { View, StyleSheet, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Alert } from 'react-native';
import { useEffect, useState } from 'react'
import { firebaseAuth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ActivityIndicator } from 'react-native';


export default function SignIn({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const auth = firebaseAuth;


  const handleSignIn = async () => {
    if (email === '' || password === '') {
      Alert.alert('Hata', 'Lütfen email ve şifre alanlarını doldurunuz.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      // console.log(response);
    } catch (error) {
      setLoading(false);
      Alert.alert('Hata', 'Girdiğiniz bilgiler hatalı.');
      // console.log(error);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior='height'>
      <Image source={require('../images/bg_2.jpg')} style={styles.backgroundImage} />
      <Text style={styles.headerText}>GİRİŞ YAP</Text>
      <TextInput style={styles.textinput} placeholder="Email" value={email} onChangeText={(text) => setEmail(text)}></TextInput>
      <TextInput style={styles.textinput} placeholder="Şifre" value={password} onChangeText={(text) => setPassword(text)} secureTextEntry></TextInput>
      {loading ? (<ActivityIndicator size="large" color="#0000ff" />) : (
        <>
          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Giriş Yap</Text>
          </TouchableOpacity>

          <Text style={styles.smallText}> Hesabın yok mu? Kayıt olabilirsin !</Text>

          <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Signup')}>
            <Text style={styles.buttonText}>Kayıt Ol</Text>
          </TouchableOpacity>
        </>
      )}
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
    marginTop: 20,
  },
  button: {
    width: 250,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: '#B97AFF',
    marginTop: 20,
    marginBottom: 20,
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
