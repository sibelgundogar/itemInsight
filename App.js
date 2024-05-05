import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from './firebase';

import Splash from './screens/Splash';
import Signin from './screens/Signin';
import Signup from './screens/Signup';
import Home from './screens/Home';

const Stack = createStackNavigator();

export default function App() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            setUser(user);
        });

        return unsubscribe;
    }, []);

    return (
        <View style={styles.container}>
            <NavigationContainer>
                <Stack.Navigator>
                    {
                        //buradaki userdaki ünlem kaldır sign in için sormasın diye koydun
                    }
                    {!user ? (
                        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
                    ) : (
                        <>
                            <Stack.Screen name="Splash" component={Splash} options={{ headerShown: false }} />
                            <Stack.Screen name="Signin" component={Signin} options={{ headerShown: false }} />
                            <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
                        </>
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
});
