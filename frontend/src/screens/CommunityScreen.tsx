import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, Image, ScrollView, TextInput, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Text, FAB, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PostCard from '../components/PostCard';
import TopNavigation from '../components/TopNavigation';

const API_URL = 'http://localhost:4000';

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    checkLoginStatus();
    fetchPosts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/community?page=1&limit=20`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
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
        setPosts(posts.map(post =>
          post._id === postId
            ? { ...post, netVotes: data.data.netVotes }
            : post
        ));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleCreatePost = () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to create a post');
      return;
    }
    try {
      navigation.navigate('CreatePost' as never);
    } catch (error) {
      Alert.alert('Error', 'Failed to open create post screen');
    }
  };

  const handlePostPress = (post) => {
    navigation.navigate('PostDetail' as never, { postId: post._id } as never);
  };

  const handleProfilePress = (userId) => {
    if (userId) {
      navigation.navigate('UserProfile' as never, { userId } as never);
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity>
          <Icon name="menu" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <View>
            <Image 
              source={{ uri: 'https://api.dicebear.com/7.x/faces/svg?seed=MyProfile' }} 
              style={styles.profileAvatar}
            />
            <View style={styles.activeDot} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Icon name="magnify" size={22} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Icon name="microphone-outline" size={22} color="#9CA3AF" style={styles.micIcon} />
      </View>

      <Text style={styles.feedsTitle}>Feeds</Text>
    </View>
  );

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
        <Text style={styles.loadingText}>Loading community feeds...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopNavigation activeTab="Community" />
      <View style={styles.container}>
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
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
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={handleCreatePost}
          color="#FFFFFF"
          testID="create-post-fab"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 4,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  profileAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F97316',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 48,
    marginTop: 10,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 0,
  },
  micIcon: {
    marginLeft: 8,
  },
  feedsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 16,
    backgroundColor: '#10B981',
    borderRadius: 28,
  },
});
