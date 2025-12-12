import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { AntDesign, Feather } from '@expo/vector-icons'; 
import * as ImagePicker from 'expo-image-picker'; 
import * as Location from 'expo-location'; 


const API_URL = 'http://192.168.0.3:3000/api/reports'; 

const Colors = {
  primary: '#333333',     
  accent: '#007BFF',      
  bg: '#F8F8F8',  
  card: '#FFFFFF',        
  shadow: 'rgba(0, 0, 0, 0.1)'
};

export default function App() {
  const [reports, setReports] = useState([]);
  const [screen, setScreen] = useState('login'); 
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setReports(data);
    } catch (e) {
      console.log("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const addReport = async (data) => {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      fetchReports();
      setScreen('home');
      Alert.alert("Éxito", "Reporte enviado correctamente.");
    } catch (e) {
      Alert.alert("Error", "No se pudo conectar con el servidor.");
    }
  };

  // Lógica de Navegación
  if (screen === 'login') return <AuthScreen onAuth={() => { setScreen('home'); fetchReports(); }} />;
  if (screen === 'newReport') return <NewReportScreen onSubmit={addReport} onCancel={() => setScreen('home')} />;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes Recientes</Text>
        <TouchableOpacity onPress={fetchReports}><Feather name="refresh-ccw" size={22} color={Colors.primary} /></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {reports.length > 0 ? (
          reports.map(r => (
            <View key={r.id} style={cardStyles.container}>
              <Image source={{ uri: r.photo_url || 'https://via.placeholder.com/150' }} style={cardStyles.image} />
              <View style={cardStyles.content}>
                <Text style={cardStyles.title}>{r.title}</Text>
                <Text style={cardStyles.summary}>{r.summary}</Text>
                <View style={cardStyles.location}>
                  <Feather name="map-pin" size={14} color={Colors.accent} />
                  <Text style={cardStyles.locationText}>{r.location}</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <Text style={{textAlign: 'center', marginTop: 50, color: '#999'}}>No hay reportes nuevos.</Text>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => setScreen('newReport')}>
        <AntDesign name="plus" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

// Login y registro
const AuthScreen = ({ onAuth }) => {
  const [isRegister, setIsRegister] = useState(false);
  return (
    <View style={loginStyles.container}>
      <Text style={loginStyles.logo}>Reporta</Text>
      <Text style={loginStyles.subtitle}>{isRegister ? 'Crea tu cuenta' : 'Tu voz, tu comunidad'}</Text>
      
      <View style={loginStyles.inputBox}>
        <Feather name="mail" size={20} color="#999" />
        <TextInput style={loginStyles.input} placeholder="Correo electrónico" />
      </View>
      
      <View style={loginStyles.inputBox}>
        <Feather name="lock" size={20} color="#999" />
        <TextInput style={loginStyles.input} placeholder="Contraseña" secureTextEntry />
      </View>

      <TouchableOpacity style={loginStyles.btn} onPress={onAuth}>
        <Text style={loginStyles.btnText}>{isRegister ? 'Registrarse' : 'Iniciar Sesión'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)}>
        <Text style={loginStyles.switchText}>
          {isRegister ? '¿Ya tienes cuenta? Entra aquí' : '¿No tienes cuenta? Regístrate'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// Nuevo reporte
const NewReportScreen = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [photo, setPhoto] = useState(null);
  const [location, setLocation] = useState('Obtener ubicación...');

  const handleGps = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    let loc = await Location.getCurrentPositionAsync({});
    let geo = await Location.reverseGeocodeAsync({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    setLocation(`${geo[0].street}, ${geo[0].city}`);
  };

  const handlePhoto = async () => {
    let res = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!res.canceled) setPhoto(res.assets[0].uri);
  };

  return (
    <View style={newReportStyles.container}>
      <View style={newReportStyles.header}>
        <TouchableOpacity onPress={onCancel}><AntDesign name="close" size={26} color={Colors.primary} /></TouchableOpacity>
        <Text style={newReportStyles.headerTitle}>Crear Reporte</Text>
        <View style={{width: 26}} />
      </View>

      <ScrollView contentContainerStyle={newReportStyles.content}>
        <TouchableOpacity style={newReportStyles.photoBox} onPress={handlePhoto}>
          {photo ? <Image source={{ uri: photo }} style={newReportStyles.photoPreview} /> : <Feather name="camera" size={50} color="#ccc" />}
        </TouchableOpacity>

        <TextInput style={newReportStyles.input} placeholder="¿Qué sucede? (Título)" onChangeText={setTitle} />
        <TextInput style={[newReportStyles.input, {height: 100, textAlignVertical: 'top'}]} placeholder="Detalles del reporte..." multiline onChangeText={setSummary} />

        <TouchableOpacity style={newReportStyles.locBox} onPress={handleGps}>
          <Feather name="map-pin" size={20} color={Colors.accent} />
          <Text style={newReportStyles.locText}>{location}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={newReportStyles.btnSend} onPress={() => onSubmit({title, summary, location, photo_url: photo})}>
          <Text style={newReportStyles.btnSendText}>Publicar Reporte</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Estilo
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.primary },
  scroll: { padding: 15, paddingBottom: 100 },
  fab: { position: 'absolute', right: 25, bottom: 30, backgroundColor: Colors.accent, width: 65, height: 65, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 5 }
});

const cardStyles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 15, marginBottom: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  image: { width: '100%', height: 200 },
  content: { padding: 15 },
  title: { fontSize: 19, fontWeight: 'bold', color: Colors.primary, marginBottom: 5 },
  summary: { fontSize: 14, color: '#555', marginBottom: 10 },
  location: { flexDirection: 'row', alignItems: 'center' },
  locationText: { fontSize: 13, color: Colors.accent, marginLeft: 5, fontWeight: '600' }
});

const loginStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center', padding: 30 },
  logo: { fontSize: 55, fontWeight: '900', color: Colors.accent, letterSpacing: -2 },
  subtitle: { fontSize: 18, color: '#666', marginBottom: 40 },
  inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 15, width: '100%', borderWidth: 1, borderColor: '#eee' },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  btn: { backgroundColor: Colors.accent, width: '100%', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  btnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  switchText: { marginTop: 20, color: Colors.primary, fontWeight: '600' }
});

const newReportStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20, backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  photoBox: { width: '100%', height: 220, backgroundColor: '#fff', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed', marginBottom: 20 },
  photoPreview: { width: '100%', height: '100%', borderRadius: 15 },
  input: { backgroundColor: '#fff', padding: 15, borderRadius: 12, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#eee' },
  locBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginBottom: 30 },
  locText: { marginLeft: 10, color: Colors.accent, fontWeight: 'bold' },
  btnSend: { backgroundColor: Colors.accent, height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  btnSendText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});