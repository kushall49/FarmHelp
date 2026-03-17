import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Chip, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeGoBack } from '../navigation/AppNavigator';
import { sanitizeImageUri, getSafeAvatarUrl } from '../utils/uriValidation';

const API_URL = 'http://localhost:4000';

export default function UserProfileScreen() {
  // ✅ NAVIGATION FIX: Use safe navigation with deep link fallback
  const handleGoBack = useSafeGoBack();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params as any;

  useEffect(() => {
    checkIfOwnProfile();
    fetchUserProfile();
    fetchUserPosts();
  }, [userId]);

  const checkIfOwnProfile = async () => {
    const currentUserId = await AsyncStorage.getItem('userId');
    setIsOwnProfile(currentUserId === userId);
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/user/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', 'Could not load user profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/community/user/${userId}?limit=20`);
      const data = await response.json();
      
      if (data.success) {
        setPosts(data.data);
      }
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const getAvatarUrl = (username: string) => {
    // Using DiceBear API for consistent avatars
    return `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=10b981`;
  };

  const handleEditProfile = () => {
    // @ts-ignore - Navigation type issue
    navigation.navigate('EditProfile');
  };

  const handlePostPress = (post: any) => {
    // @ts-ignore - Navigation type issue
    navigation.navigate('PostDetail', { postId: post._id });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Icon name="account-off-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {user.avatar && typeof user.avatar === 'string' && user.avatar.match(/^https?:\/\//) ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <Image 
                  source={{ uri: getAvatarUrl(user.username || user.email) }} 
                  style={styles.avatar}
                />
              )}
              <View style={[styles.badge, styles.badgeActive]}>
                <Icon name="check-circle" size={20} color="#FFFFFF" />
              </View>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.displayName}>
                {user.displayName || user.username || 'Anonymous'}
              </Text>
              <Text style={styles.username}>@{user.username}</Text>
              
              {user.location && (
                <View style={styles.locationRow}>
                  <Icon name="map-marker" size={16} color="#6B7280" />
                  <Text style={styles.locationText}>{user.location}</Text>
                </View>
              )}

              <Text style={styles.joinedDate}>
                <Icon name="calendar" size={14} color="#9CA3AF" />
                {' '}Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Text>
            </View>
          </View>

          {/* Bio */}
          {user.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.bio}>{user.bio}</Text>
            </View>
          )}

          {/* Farm Info */}
          {user.farmSize && (
            <View style={styles.farmInfo}>
              <View style={styles.farmInfoItem}>
                <Icon name="barn" size={20} color="#10B981" />
                <Text style={styles.farmInfoText}>Farm Size: {user.farmSize}</Text>
              </View>
            </View>
          )}

          {/* Expertise Tags */}
          {user.expertise && user.expertise.length > 0 && (
            <View style={styles.expertiseSection}>
              <Text style={styles.sectionTitle}>Expertise:</Text>
              <View style={styles.chipContainer}>
                {user.expertise.map((skill: string, index: number) => (
                  <Chip 
                    key={index} 
                    style={styles.chip}
                    textStyle={styles.chipText}
                    icon="school-outline"
                  >
                    {skill}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {posts.reduce((sum, post) => sum + (post.netVotes || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Karma</Text>
            </View>
            <Divider style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {posts.reduce((sum, post) => sum + (post.commentCount || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Discussions</Text>
            </View>
          </View>

          {/* Edit Profile Button */}
          {isOwnProfile && (
            <Button
              mode="outlined"
              onPress={handleEditProfile}
              style={styles.editButton}
              icon="pencil"
            >
              Edit Profile
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* User's Posts */}
      <View style={styles.postsSection}>
        <Text style={styles.sectionHeader}>
          <Icon name="post-outline" size={20} /> Recent Posts
        </Text>

        {posts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="post-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No posts yet</Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          posts.map((post: any) => (
            <TouchableOpacity key={post._id} onPress={() => handlePostPress(post)}>
              <Card style={styles.postCard}>
                <Card.Content>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <Text style={styles.postContent} numberOfLines={2}>
                    {post.content}
                  </Text>
                  
                  <View style={styles.postMeta}>
                    <View style={styles.postMetaItem}>
                      <Icon name="arrow-up-bold" size={16} color="#10B981" />
                      <Text style={styles.postMetaText}>{post.netVotes || 0}</Text>
                    </View>
                    <View style={styles.postMetaItem}>
                      <Icon name="comment-outline" size={16} color="#6B7280" />
                      <Text style={styles.postMetaText}>{post.commentCount || 0}</Text>
                    </View>
                    <Text style={styles.postDate}>
                      {new Date(post.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
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
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600',
  },
  headerCard: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E5E7EB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeActive: {
    backgroundColor: '#10B981',
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  displayName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  joinedDate: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },
  bioSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  farmInfo: {
    marginTop: 12,
    marginBottom: 12,
  },
  farmInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmInfoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  expertiseSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#ECFDF5',
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: '#047857',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  editButton: {
    marginTop: 8,
    borderColor: '#10B981',
  },
  postsSection: {
    margin: 16,
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  postCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 1,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  postContent: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  postMetaText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  postDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 'auto',
  },
});
