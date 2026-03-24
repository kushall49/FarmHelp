import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
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
    return `https://api.dicebear.com/7.x/faces/svg?seed=${username}&backgroundColor=b6e3f4`;
  };

  const formatNumber = (num: number) => {
    if (!num) return '0';
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
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
            <Text style={styles.name}>
              {post.author?.name || post.author?.username || 'Anonymous'}
            </Text>
            <Text style={styles.username}>
              @{((post.author?.username || 'anonymous').toLowerCase()).replace(/\s+/g, '')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.6}>
          <Icon name="dots-horizontal" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Image */}
      {post.imageUrl && post.imageUrl.trim() !== '' && (
        <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: post.imageUrl }}
              style={styles.postImage}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
      )}

      {/* Caption & Content */}
      <TouchableOpacity onPress={onPress} activeOpacity={0.95}>
        <View style={styles.contentSection}>
          {post.title ? (
             <Text style={styles.captionTitle}>{post.title}</Text>
          ) : null}
          <Text style={styles.caption} numberOfLines={4}>
            {post.content}
          </Text>
          
          <Text style={styles.tags}>
            #landscape #flora #nature
          </Text>
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actionsBar}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onUpvote} activeOpacity={0.6}>
            <Icon name="heart-outline" size={24} color="#6B7280" />
            <Text style={styles.actionText}>{formatNumber(post.netVotes)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.6}>
            <Icon name="comment-outline" size={24} color="#6B7280" />
            <Text style={styles.actionText}>{formatNumber(post.commentCount)}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} activeOpacity={0.6}>
          <Icon name="bookmark-outline" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
  },
  authorInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  username: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 2,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3, // Instagram landscape/photo ratio
    maxHeight: 400, // Prevent it from getting too large on big screens
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    marginBottom: 16,
  },
  captionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    marginBottom: 8,
  },
  tags: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    padding: 0,
  },
});
