import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeGoBack } from '../navigation/AppNavigator';

const API_URL = 'http://localhost:4000';

export default function CreatePostScreen() {
  // ✅ NAVIGATION FIX: Use safe navigation with deep link fallback
  const handleGoBack = useSafeGoBack();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to select images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3], // Match the display ratio precisely
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('content', content.trim());

      // Add image if selected
      if (selectedImage) {
        console.log('📸 Converting image to blob for upload...');
        
        // Convert URI to Blob for web compatibility
        const response = await fetch(selectedImage);
        const blob = await response.blob();
        const file = new File([blob], `post_${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        console.log('✅ Image file created:', {
          name: file.name,
          type: file.type,
          size: file.size,
        });
        
        formData.append('image', file);
      }

      const response = await fetch(`${API_URL}/api/community`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type header, let browser set it with boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Post created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Could not create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>✍️ Create New Post</Text>
          <Text style={styles.headerSubtitle}>Share your farming knowledge</Text>
        </View>

        {/* Title Input */}
        <TextInput
          label="Post Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Best time to plant tomatoes?"
          maxLength={200}
          disabled={loading}
          outlineColor="#D1D5DB"
          activeOutlineColor="#10B981"
        />

        <Text style={styles.characterCount}>{title.length}/200</Text>

        {/* Content Input */}
        <TextInput
          label="Post Content"
          value={content}
          onChangeText={setContent}
          mode="outlined"
          multiline
          numberOfLines={10}
          style={[styles.input, styles.contentInput]}
          placeholder="Share your experience, ask a question, or provide advice to fellow farmers..."
          maxLength={2000}
          disabled={loading}
          outlineColor="#D1D5DB"
          activeOutlineColor="#10B981"
        />

        <Text style={styles.characterCount}>{content.length}/2000</Text>

        {/* Image Upload Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionLabel}>📸 Add Image (Optional)</Text>
          
          {selectedImage ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={removeImage}
              >
                <Icon name="close-circle" size={32} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={pickImage}
              disabled={loading}
            >
              <Icon name="camera-plus" size={48} color="#10B981" />
              <Text style={styles.uploadButtonText}>Tap to upload image</Text>
              <Text style={styles.uploadButtonSubtext}>JPG, PNG, GIF (Max 5MB)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesBox}>
          <Text style={styles.guidelinesTitle}>📋 Posting Guidelines:</Text>
          <Text style={styles.guidelineItem}>• Be respectful and helpful</Text>
          <Text style={styles.guidelineItem}>• Share accurate information</Text>
          <Text style={styles.guidelineItem}>• Stay on topic about farming</Text>
          <Text style={styles.guidelineItem}>• Ask clear, specific questions</Text>
          <Text style={styles.guidelineItem}>• Images should be relevant to your post</Text>
        </View>

        {/* Submit Button */}
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={loading || !title.trim() || !content.trim()}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          buttonColor="#10B981"
          loading={loading}
        >
          {loading ? 'Creating Post...' : 'Publish Post'}
        </Button>

        {/* Cancel Button */}
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          disabled={loading}
          style={styles.cancelButton}
          textColor="#6B7280"
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  contentInput: {
    minHeight: 200,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  guidelinesBox: {
    backgroundColor: '#ECFDF5',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
    marginBottom: 24,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#065F46',
    marginBottom: 8,
  },
  guidelineItem: {
    fontSize: 13,
    color: '#047857',
    marginBottom: 4,
  },
  submitButton: {
    marginBottom: 12,
    borderRadius: 8,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
  cancelButton: {
    borderRadius: 8,
    borderColor: '#D1D5DB',
  },
  imageSection: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  uploadButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 12,
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
