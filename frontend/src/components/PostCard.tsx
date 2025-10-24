import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PostCardProps {
  post: any;
  onPress: () => void;
  onProfilePress: (userId: string) => void;
  onUpvote: () => void;
  onDownvote: () => void;
}

export default function PostCard({ 
  post, 
  onPress, 
  onProfilePress, 
  onUpvote, 
  onDownvote 
}: PostCardProps) {
  
  const getAvatarUrl = (username: string) => {
    return `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=10b981`;
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Card style={styles.card}>
      {/* Header - Instagram Style */}
      <Card.Content style={styles.header}>
        <TouchableOpacity 
          style={styles.authorSection}
          onPress={() => onProfilePress(post.author?._id)}
          activeOpacity={0.7}
        >
          <Image 
            source={{ 
              uri: post.author?.avatar || getAvatarUrl(post.author?.username || 'User') 
            }}
            style={styles.avatar}
          />
          <View style={styles.authorInfo}>
            <Text style={styles.username}>
              {post.author?.username || 'Anonymous'}
            </Text>
            {post.author?.location && (
              <Text style={styles.location}>{post.author.location}</Text>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.6}>
          <Icon name="dots-horizontal" size={24} color="#262626" />
        </TouchableOpacity>
      </Card.Content>

      {/* Image - Instagram Style (Square/Portrait, High Quality) */}
      {post.imageUrl && post.imageUrl.trim() !== '' && (
        <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
          <View style={styles.imageContainer}>
            <Image 
              source={{ 
                uri: post.imageUrl,
              }} 
              style={styles.postImage}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      )}

      {/* Actions Bar - Instagram Style */}
      <Card.Content style={styles.actionsBar}>
        <View style={styles.leftActions}>
          {/* Like Button (Upvote) */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onUpvote}
            activeOpacity={0.6}
          >
            <Icon name="heart-outline" size={28} color="#262626" />
          </TouchableOpacity>
          
          {/* Comment Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={onPress}
            activeOpacity={0.6}
          >
            <Icon name="comment-outline" size={26} color="#262626" />
          </TouchableOpacity>
          
          {/* Share Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            activeOpacity={0.6}
          >
            <Icon name="share-outline" size={26} color="#262626" />
          </TouchableOpacity>
        </View>
        
        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton}
          activeOpacity={0.6}
        >
          <Icon name="bookmark-outline" size={26} color="#262626" />
        </TouchableOpacity>
      </Card.Content>

      {/* Likes Count */}
      <Card.Content style={styles.likesSection}>
        <Text style={styles.likesText}>
          <Text style={styles.likesBold}>{post.netVotes > 0 ? post.netVotes : 0} likes</Text>
        </Text>
      </Card.Content>

      {/* Caption - Instagram Style */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
        <Card.Content style={styles.captionSection}>
          <Text style={styles.caption}>
            <Text style={styles.captionUsername}>{post.author?.username || 'Anonymous'} </Text>
            <Text style={styles.captionTitle}>{post.title}</Text>
            {'\n'}
            <Text style={styles.captionContent}>{post.content}</Text>
          </Text>
        </Card.Content>
      </TouchableOpacity>

      {/* Comments Preview */}
      {post.commentCount > 0 && (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <Card.Content style={styles.commentsPreview}>
            <Text style={styles.viewCommentsText}>
              View all {post.commentCount} comments
            </Text>
          </Card.Content>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <Card.Content style={styles.timestampSection}>
        <Text style={styles.timestamp}>{formatTimeAgo(post.createdAt).toUpperCase()}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#DBDBDB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E1E8ED',
    borderWidth: 1,
    borderColor: '#DBDBDB',
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    letterSpacing: -0.2,
  },
  location: {
    fontSize: 11,
    color: '#262626',
    marginTop: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#FAFAFA',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
  },
  likesSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  likesText: {
    fontSize: 14,
    color: '#262626',
  },
  likesBold: {
    fontWeight: '600',
  },
  captionSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  caption: {
    fontSize: 14,
    lineHeight: 18,
    color: '#262626',
  },
  captionUsername: {
    fontWeight: '600',
    color: '#262626',
  },
  captionTitle: {
    fontWeight: '500',
    color: '#262626',
  },
  captionContent: {
    fontWeight: '400',
    color: '#262626',
  },
  commentsPreview: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  viewCommentsText: {
    fontSize: 14,
    color: '#8E8E8E',
    fontWeight: '400',
  },
  timestampSection: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  timestamp: {
    fontSize: 10,
    color: '#8E8E8E',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});
