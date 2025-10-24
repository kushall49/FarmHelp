import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, Image } from 'react-native';
import { Text, Card, Button, FAB, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PostCard from '../components/PostCard';

const API_URL = 'http://localhost:4000';

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    checkLoginStatus();
    fetchPosts();
  }, []);

  // Refresh posts when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Community screen focused - refreshing posts');
      fetchPosts();
    }, [])
  );

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const fetchPosts = async () => {
    try {
      console.log('📡 Fetching posts from:', `${API_URL}/api/community`);
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/community?page=1&limit=20`);
      console.log('📥 Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 Response data:', data);
      
      if (data.success) {
        console.log(`✅ Loaded ${data.data.length} posts`);
        
        // Debug: Check which posts have images
        const postsWithImages = data.data.filter(p => p.imageUrl && p.imageUrl.trim() !== '');
        console.log(`📸 Posts with images: ${postsWithImages.length}/${data.data.length}`);
        postsWithImages.forEach(p => {
          console.log('  - Post:', p.title, 'Image:', p.imageUrl);
        });
        
        setPosts(data.data);
      } else {
        console.error('❌ Failed to fetch posts:', data.message);
        Alert.alert('Error', data.message || 'Failed to fetch posts');
      }
    } catch (error) {
      console.error('❌ Error fetching posts:', error);
      Alert.alert('Connection Error', 'Could not load posts. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const handleVote = async (postId, voteType) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to vote on posts');
      navigation.navigate('Login' as never);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/community/${postId}/${voteType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, netVotes: data.data.netVotes }
            : post
        ));
      }
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to vote. Please try again.');
    }
  };

  const handleCreatePost = () => {
    console.log('Create Post button clicked!');
    console.log('Is logged in:', isLoggedIn);
    
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to create a post', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Login', onPress: () => navigation.navigate('Login' as never) }
      ]);
      return;
    }
    
    console.log('Navigating to CreatePost...');
    try {
      navigation.navigate('CreatePost' as never);
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Failed to open create post screen');
    }
  };

  const handlePostPress = (post) => {
    // @ts-ignore - Navigation type issue
    navigation.navigate('PostDetail', { postId: post._id });
  };

  const handleProfilePress = (userId) => {
    if (userId) {
      // @ts-ignore - Navigation type issue
      navigation.navigate('UserProfile', { userId });
    }
  };

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onPress={() => handlePostPress(item)}
      onProfilePress={handleProfilePress}
      onUpvote={() => handleVote(item._id, 'upvote')}
      onDownvote={() => handleVote(item._id, 'downvote')}
    />
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading community posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🌾 Farm Community</Text>
        <Text style={styles.headerSubtitle}>Share knowledge, ask questions</Text>
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="post-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share!</Text>
          </View>
        }
      />

      {/* Create Post FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreatePost}
        color="#FFFFFF"
        testID="create-post-fab"
        label="New Post"
        visible={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  listContainer: {
    padding: 16,
  },
  postCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  authorName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  authorLocation: {
    fontSize: 11,
    color: '#9CA3AF',
    marginRight: 4,
  },
  postTime: {
    fontSize: 11,
    color: '#9CA3AF',
    marginLeft: 4,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 0,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#000000',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#1F2937',
  },
  imageOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  voteSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  voteButton: {
    padding: 6,
  },
  voteCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginHorizontal: 8,
    minWidth: 32,
    textAlign: 'center',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
  },
  commentCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 6,
  },
  shareButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#10B981',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
