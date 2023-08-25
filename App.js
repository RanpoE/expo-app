import { StatusBar } from 'expo-status-bar';
import { Camera, CameraType } from 'expo-camera';
import { useState, useRef } from 'react';
import { StyleSheet, View, Platform, TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import domtoimage from 'dom-to-image';
import DomToImage from 'dom-to-image';


import { Button, ImageViewer, CircleButton, IconButton, EmojiPicker, EmojiList, EmojiSticker } from './components'

import { splashImg } from './assets';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';

export default function App() {
  const imageRef = useRef();
  const [selectedImage, setSelectedImage] = useState(null)
  const [showAppOptions, setShowAppOptions] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [pickedEmoji, setPickedEmoji] = useState(null)
  const [cameraRef, setCameraRef] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();


  const [status, requestPermissions] = MediaLibrary.usePermissions()

  const toggleCameraType = () => {
    setType(current => (current === Camera.Constants.Type.back ? Camera.Constants.Type.front : Camera.Constants.Type.back));
  }

  const handleCapture = async () => {
    if (cameraRef) {
      const options = { base64: true }
      const photo = await cameraRef.takePictureAsync(options);
      // Do something with the captured photo
      const { uri } = photo
      setSelectedImage(uri)
      setImageData(photo)
    }
  };

  const handleUploadPhoto = async () => {
    const formData = new FormData();
    formData.append('photo', {
      uri: selectedImage,
      type: 'image/jpg',
      name: 'photo.jpg',
    });
    const data = {
      image: selectedImage
    }

    fetch('http://127.0.0.1:8000/v1/upload64', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Upload success:', data);
        // Handle the response from the server if needed
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  if (status === null) {
    requestPermission()
  }

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1
    })
    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri)
      setShowAppOptions(true)
    } else {
      alert('You did not select an image.')
    }
  }
  const onReset = () => {
    setShowAppOptions(false);
  };

  const onAddSticker = () => {
    // we will implement this later
    setIsModalVisible(true)
  };

  const onModalClose = () => {
    setIsModalVisible(false)
  }

  const onSaveImageAsync = async () => {
    // we will implement this later
    if (Platform.OS !== 'web') {
      try {
        const localUri = await captureRef(imageRef, {
          height: 440,
          quality: 1,
        });

        await MediaLibrary.saveToLibraryAsync(localUri);
        if (localUri) {
          alert("Saved!");
        }
      } catch (e) {
        console.log(e);
      }
    } else {
      try {
        const dataUrl = await DomToImage.toJpeg(imageRef.current, {
          quality: 0.95,
          width: 320,
          height: 440,
        });

        let link = document.createElement('a');
        link.download = 'sticker-smash.jpeg';
        link.href = dataUrl;
        link.click();
      } catch (e) {
        console.log(e);
      }
    }
  };
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.imageContainer}>
        <View ref={imageRef} collapsable={false}>
          <ImageViewer placeholderImageSource={splashImg} selectedImage={selectedImage} />
          {pickedEmoji !== null ? <EmojiSticker imageSize={40} stickerSource={pickedEmoji} /> : null}
        </View>
        {/* {selectedImage ? */}
        {/* <ImageViewer placeholderImageSource={splashImg} selectedImage={selectedImage} /> */}
        {/* //   : <Camera style={styles.camera} type={type} ref={ref => setCameraRef(ref)} /> */}
        {/* // } */}

      </View>
      {showAppOptions ? (
        <View style={styles.optionsContainer}>
          <View style={styles.optionsRow}>
            <IconButton icon="refresh" label="Reset" onPress={onReset} />
            <CircleButton onPress={onAddSticker} />
            <IconButton icon="save-alt" label="Save" onPress={onSaveImageAsync} />
          </View>
        </View>
      ) : (
        <View style={styles.footerContainer}>
          <Button theme="primary" onPress={pickImageAsync} label="Choose a photo" />
          <Button onPress={() => setShowAppOptions(true)} label="Use this photo" />

          {/* {selectedImage ?
            (
              <>
                <Button onPress={() => setSelectedImage(null)} label="Retake picture" />
                <Button onPress={handleUploadPhoto} label="Upload picture" />
              </>
            )
            : (
              <>
                <Button onPress={toggleCameraType} label="Flip camera" />
                <Button onPress={handleCapture} label="Capture picture" />
              </>
            )
          } */}

          {/* <TouchableOpacity
            // onPress={openImagePickerAsync}
            onPress={toggleCameraType}
            style={styles.button}>
            <Text style={styles.buttonText}>Flip Camera</Text>
          </TouchableOpacity> */}
        </View>
      )}
      <EmojiPicker isVisible={isModalVisible} onClose={onModalClose}>
        <EmojiList onSelect={setPickedEmoji} onCloseModal={onModalClose} />
      </EmojiPicker>
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 58,
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  camera: {
    width: 320,
    height: '40%'
  },
  optionsContainer: {
    position: 'absolute',
    bottom: 80,
  },
  optionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center'
  }
});
