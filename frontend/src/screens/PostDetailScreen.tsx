import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { Text, Card, TextInput, Button, ActivityIndicator, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeGoBack } from '../navigation/AppNavigator';
import { sanitizeImageUri, getSafeAvatarUrl } from '../utils/uriValidation';

const API_URL = 'http://localhost:4000';

export default function PostDetailScreen() {
  // ✅ NAVIGATION FIX: Use safe navigation with deep link fallback
  const handleGoBack = useSafeGoBack();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params as any;

  useEffect(() => {
    checkLoginStatus();
    fetchPostAndComments();
  }, []);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    const userId = await AsyncStorage.getItem('userId');
    setIsLoggedIn(!!token);
    setCurrentUserId(userId);
  };

  const fetchPostAndComments = async () => {
    try {
      setLoading(true);

      // Fetch post
      const postResponse = await fetch(`${API_URL}/api/community/${postId}`);
      const postData = await postResponse.json();

      if (postData.success) {
        setPost(postData.data);
      }

      // Fetch comments
      const commentsResponse = await fetch(`${API_URL}/api/community/${postId}/comments`);
      const commentsData = await commentsResponse.json();

      if (commentsData.success) {
        setComments(commentsData.data);
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      Alert.alert('Error', 'Could not load post. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPostAndComments();
  };

  const handleVotePost = async (voteType) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to vote');
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
        setPost({ ...post, netVotes: data.data.netVotes });
      }
    } catch (error) {
      console.error('Error voting on post:', error);
    }
  };

  const handleVoteComment = async (commentId, voteType) => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to vote');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(
        `${API_URL}/api/community/${postId}/comments/${commentId}/${voteType}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Update comment in local state
        setComments(comments.map(c => 
          c._id === commentId 
            ? { ...c, netVotes: data.data.netVotes }
            : c
        ));
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const handleAddComment = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login Required', 'Please login to comment');
      navigation.navigate('Login' as never);
      return;
    }

    if (!newComment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(`${API_URL}/api/community/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          text: newComment.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setNewComment('');
        fetchPostAndComments(); // Refresh to show new comment
        Alert.alert('Success', 'Comment added!');
      } else {
        Alert.alert('Error', data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Could not add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              const response = await fetch(`${API_URL}/api/community/${postId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              const data = await response.json();

              if (data.success) {
                Alert.alert('Success', 'Post deleted', [
                  { text: 'OK', onPress: () => navigation.goBack() },
                ]);
              } else {
                Alert.alert('Error', data.message || 'Failed to delete post');
              }
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Could not delete post');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.centered}>
        <Icon name="alert-circle-outline" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  const isAuthor = post.author?._id === currentUserId;

  const handleProfilePress = (userId) => {
    if (userId) {
      // @ts-ignore - Navigation type issue
      navigation.navigate('UserProfile', { userId });
    }
  };

  const getAvatarUrl = (username) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=10b981`;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Post Card */}
      <Card style={styles.postCard}>
        <Card.Content>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <TouchableOpacity 
              style={styles.authorInfo}
              onPress={() => handleProfilePress(post.author?._id)}
            >
              <Image 
                source={{ uri: post.author?.avatar || getAvatarUrl(post.author?.username || 'User') }}
                style={styles.authorAvatar}
              />
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>
                  {post.author?.username || 'Anonymous'}
                </Text>
                <Text style={styles.postTime}>
                  {new Date(post.createdAt).toLocaleDateString()} at{' '}
                  {new Date(post.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            </TouchableOpacity>

            {isAuthor && (
              <TouchableOpacity onPress={handleDeletePost}>
                <Icon name="delete" size={24} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>

          {/* Post Title */}
          <Text style={styles.postTitle}>{post.title}</Text>

          {/* Post Content */}
          <Text style={styles.postContent}>{post.content}</Text>
        </Card.Content>

        {/* Post Image (if exists) - Full Width Reddit Style */}
        {post.imageUrl && (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: post.imageUrl }} 
              style={styles.postImage}
              resizeMode="contain"
            />
          </View>
        )}

        <Card.Content>
          {/* Vote Section */}
          <View style={styles.voteContainer}>
            <TouchableOpacity 
              style={styles.voteButton}
              onPress={() => handleVotePost('upvote')}
            >
              <Icon name="arrow-up-bold" size={28} color="#10B981" />
            </TouchableOpacity>
            
            <Text style={styles.voteCount}>{post.netVotes || 0}</Text>
            
            <TouchableOpacity 
              style={styles.voteButton}
              onPress={() => handleVotePost('downvote')}
            >
              <Icon name="arrow-down-bold" size={28} color="#EF4444" />
            </TouchableOpacity>

            <View style={styles.commentCount}>
              <Icon name="comment-outline" size={20} color="#6B7280" />
              <Text style={styles.commentCountText}>{comments.length} comments</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Add Comment Section */}
      <Card style={styles.addCommentCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>💬 Add a Comment</Text>
          
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Share your thoughts..."
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.commentInput}
            disabled={submitting}
            outlineColor="#D1D5DB"
            activeOutlineColor="#10B981"
          />

          <Button
            mode="contained"
            onPress={handleAddComment}
            disabled={submitting || !newComment.trim()}
            loading={submitting}
            style={styles.submitCommentButton}
            buttonColor="#10B981"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </Button>
        </Card.Content>
      </Card>

      {/* Comments List */}
      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>
          💭 Comments ({comments.length})
        </Text>

        {comments.length === 0 ? (
          <View style={styles.noComments}>
            <Icon name="comment-outline" size={48} color="#D1D5DB" />
            <Text style={styles.noCommentsText}>No comments yet</Text>
            <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
          </View>
        ) : (
          comments.map((comment, index) => (
            <Card key={comment._id} style={styles.commentCard}>
              <Card.Content>
                <TouchableOpacity 
                  style={styles.commentHeader}
                  onPress={() => handleProfilePress(comment.author?._id)}
                >
                  <Image 
                    source={{ uri: comment.author?.avatar || getAvatarUrl(comment.author?.username || 'User') }}
                    style={styles.commentAvatar}
                  />
                  <Text style={styles.commentAuthor}>
                    {comment.author?.username || 'Anonymous'}
                  </Text>
                  <Text style={styles.commentTime}>
                    • {new Date(comment.createdAt).toLocaleDateString()}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.commentText}>{comment.text}</Text>

                <View style={styles.commentVotes}>
                  <TouchableOpacity onPress={() => handleVoteComment(comment._id, 'upvote')}>
                    <Icon name="arrow-up-bold" size={20} color="#10B981" />
                  </TouchableOpacity>
                  
                  <Text style={styles.commentVoteCount}>{comment.netVotes || 0}</Text>
                  
                  <TouchableOpacity onPress={() => handleVoteComment(comment._id, 'downvote')}>
                    <Icon name="arrow-down-bold" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
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
  postCard: {
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
  },
  authorDetails: {
    marginLeft: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  postTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 32,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#000000',
    marginVertical: 16,
  },
  postImage: {
    width: '100%',
    height: 500,
    backgroundColor: '#1F2937',
  },
  postContent: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 20,
  },
  voteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  voteButton: {
    padding: 4,
  },
  voteCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginHorizontal: 16,
    minWidth: 50,
    textAlign: 'center',
  },
  commentCount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  commentCountText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6B7280',
  },
  addCommentCard: {
    margin: 16,
    marginTop: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  commentInput: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  submitCommentButton: {
    borderRadius: 8,
  },
  commentsSection: {
    margin: 16,
    marginTop: 0,
  },
  noComments: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9CA3AF',
    marginTop: 12,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 4,
  },
  commentCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    marginRight: 8,
  },
  commentAuthor: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  commentTime: {
    marginLeft: 4,
    fontSize: 12,
    color: '#9CA3AF',
  },
  commentText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  commentVotes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentVoteCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginHorizontal: 12,
    minWidth: 30,
    textAlign: 'center',
  },
});
