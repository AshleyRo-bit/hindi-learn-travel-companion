import { CameraView, useCameraPermissions } from 'expo-camera';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useRef } from 'react';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const takePhoto = async () => {
  if (!cameraRef.current) {
    return;
  }

  const photo = await cameraRef.current.takePictureAsync();

  console.log(photo);
};

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.message}>
          We need permission to use your camera.
        </Text>

        <Button
          title="Allow Camera"
          onPress={requestPermission}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
      ref={cameraRef}
        style={styles.camera}
        facing="back"
      />
      <Button
  title="Take Photo"
  onPress={takePhoto}
/>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  camera: {
    flex: 1,
  },

  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  message: {
    textAlign: 'center',
    marginBottom: 16,
  },
});