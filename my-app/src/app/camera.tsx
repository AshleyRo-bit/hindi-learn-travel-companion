import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Button,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { usePhotoStore } from './store/photo-store';

const OCR_SERVICE_URL = process.env.EXPO_PUBLIC_OCR_SERVICE_URL ?? 'http://127.0.0.1:8000';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [translation, setTranslation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const router = useRouter();
  const setPhotoUri = usePhotoStore((state) => state.setPhotoUri);

  const closeCamera = () => {
    router.back();
  };

  const recognizeAndTranslate = async (uri: string) => {
    setIsProcessing(true);
    setProcessingError(null);
    setRecognizedText('');
    setTranslation('');

    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: 'camera-photo.jpg',
      } as unknown as Blob);

      const response = await fetch(`${OCR_SERVICE_URL}/translate-image`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.detail ?? 'Unable to read the photo.');
      }

      setRecognizedText(result.text ?? '');
      setTranslation(result.translation ?? '');
    } catch (error) {
      setProcessingError(
        error instanceof Error
          ? error.message
          : 'Unable to connect to the translation service.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const takePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }

    const photo = await cameraRef.current.takePictureAsync();
    if (photo?.uri) {
      setPreviewUri(photo.uri);
      await recognizeAndTranslate(photo.uri);
    }
  };

  const retakePhoto = () => {
    setPreviewUri(null);
    setRecognizedText('');
    setTranslation('');
    setProcessingError(null);
  };

  const confirmPhoto = () => {
    if (!previewUri) {
      return;
    }

    setPhotoUri(previewUri);
    closeCamera();
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Pressable style={styles.backButton} onPress={closeCamera}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
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

  if (previewUri) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.backButton} onPress={closeCamera}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>
        <Image source={{ uri: previewUri }} style={styles.preview} />
        <View style={styles.results}>
          {isProcessing ? (
            <Text style={styles.statusText}>Reading Hindi text...</Text>
          ) : processingError ? (
            <Text style={styles.errorText}>{processingError}</Text>
          ) : recognizedText ? (
            <>
              <Text style={styles.resultLabel}>Hindi</Text>
              <Text style={styles.resultText}>{recognizedText}</Text>
              <Text style={styles.resultLabel}>English</Text>
              <Text style={styles.resultText}>
                {translation || 'No translation found.'}
              </Text>
            </>
          ) : (
            <Text style={styles.statusText}>No Hindi text found.</Text>
          )}
        </View>
        <View style={styles.previewControls}>
          <Button title="Retake" onPress={retakePhoto} />
          <Button title="Use Photo" onPress={confirmPhoto} disabled={isProcessing} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={closeCamera}>
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      />
      <View style={styles.captureButton}>
        <Button title="Take Photo" onPress={takePhoto} />
      </View>
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

  preview: {
    flex: 0.7,
    resizeMode: 'contain',
    backgroundColor: '#000',
  },

  results: {
    flex: 0.3,
    padding: 16,
    backgroundColor: '#fff',
  },

  resultLabel: {
    marginTop: 4,
    marginBottom: 4,
    fontWeight: '700',
  },

  resultText: {
    marginBottom: 8,
  },

  statusText: {
    color: '#555',
  },

  errorText: {
    color: '#b00020',
  },

  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
  },

  captureButton: {
    padding: 16,
  },

  backButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    zIndex: 1,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
  },

  backButtonText: {
    color: '#fff',
    fontWeight: '600',
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