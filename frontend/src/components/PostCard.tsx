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
  isDarkMode?: boolean;
}

export default function PostCard({
  post,
  onPress,
  onProfilePress,
  onUpvote,
  onDownvote,
  isDarkMode = false
}: PostCardProps) {

  const colors = {
    cardBg: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    text: isDarkMode ? '#FFFFFF' : '#1A1A1B',
    textSecondary: isDarkMode ? '#A0A0A0' : '#787C7E',
    border: isDarkMode ? '#333333' : '#EDEFF1',
    actionBg: isDarkMode ? '#2D2D2D' : '#F6F7F8',
  };

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
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
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
            <Text style={[styles.name, { color: colors.text }]}>
              {post.author?.name || post.author?.username || 'Anonymous'}
            </Text>
            <Text style={[styles.username, { color: colors.textSecondary }]}>
              @{((post.author?.username || 'anonymous').toLowerCase()).replace(/\s+/g, '')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.6}>
          <Icon name="dots-horizontal" size={24} color={colors.textSecondary} />
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
             <Text style={[styles.captionTitle, { color: colors.text }]}>{post.title}</Text>
          ) : null}
          <Text style={[styles.caption, { color: colors.text }]} numberOfLines={4}>
            {post.content}
          </Text>
          
          <Text style={styles.tags}>
            #landscape #flora #nature
          </Text>
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View style={[styles.actionsBar, { backgroundColor: colors.actionBg, borderTopColor: colors.border }]}>
        <View style={styles.leftActions}>
          <TouchableOpacity style={styles.actionButton} onPress={onUpvote} activeOpacity={0.6}>
            <Icon name="heart-outline" size={24} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{formatNumber(post.netVotes)}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.6}>
            <Icon name="comment-outline" size={24} color={colors.textSecondary} />
            <Text style={[styles.actionText, { color: colors.textSecondary }]}>{formatNumber(post.commentCount)}</Text>
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
    marginBottom: 12,
    marginHorizontal: 0, // No side margins - let container handle width
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
  },
  authorInfo: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1B',
  },
  username: {
    fontSize: 12,
    color: '#787C7E',
    fontWeight: '400',
    marginTop: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3, // Reddit-style image ratio (not too wide)
    maxHeight: 450,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F6F7F8',
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  contentSection: {
    marginBottom: 12,
  },
  captionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1B',
    marginBottom: 6,
    lineHeight: 22,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1A1A1B',
    marginBottom: 8,
  },
  tags: {
    fontSize: 12,
    color: '#0079D3',
    fontWeight: '500',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F3F5',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    color: '#878A8C',
  },
  saveButton: {
    padding: 4,
  },
});
