import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Alert, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Text, FAB, ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PostCard from '../components/PostCard';
import TopNavigation from '../components/TopNavigation';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const API_URL = 'http://localhost:4000';

export default function CommunityScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();
  const { isDarkMode, colors } = useTheme();
  const { t } = useLanguage();

  const dynamicStyles = {
    background: isDarkMode ? '#121212' : '#F3F4F6',
    cardBg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1B',
    textSecondary: isDarkMode ? '#A0A0A0' : '#6B7280',
  };

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
    <View style={[styles.headerContainer, { backgroundColor: dynamicStyles.background }]}>
      <Text style={[styles.feedsTitle, { color: dynamicStyles.text }]}>{t('communityFeed')}</Text>
    </View>
  );

  const renderPost = ({ item }) => (
    <PostCard
      post={item}
      onPress={() => handlePostPress(item)}
      onProfilePress={handleProfilePress}
      onUpvote={() => handleVote(item._id, 'upvote')}
      onDownvote={() => handleVote(item._id, 'downvote')}
      isDarkMode={isDarkMode}
    />
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: dynamicStyles.background }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={[styles.loadingText, { color: dynamicStyles.textSecondary }]}>{t('loading')}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: dynamicStyles.background }]}>
      <TopNavigation activeTab="Community" />
      <View style={[styles.container, { backgroundColor: dynamicStyles.background }]}>
        {/* Reddit-style centered content wrapper */}
        <View style={[styles.contentWrapper, { backgroundColor: dynamicStyles.background }]}>
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
                <Icon name="post-outline" size={64} color={dynamicStyles.textSecondary} />
                <Text style={[styles.emptyText, { color: dynamicStyles.text }]}>{t('noPosts')}</Text>
                <Text style={[styles.emptySubtext, { color: dynamicStyles.textSecondary }]}>Be the first to share!</Text>
              </View>
            }
          />
        </View>
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
    backgroundColor: '#F3F4F6',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 25 : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentWrapper: {
    flex: 1,
    maxWidth: 700,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#F3F4F6',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  headerContainer: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
  },
  feedsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1B',
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingBottom: 80,
    paddingHorizontal: 16,
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
