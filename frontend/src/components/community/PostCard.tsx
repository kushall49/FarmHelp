import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Post } from '../../services/api';
import Avatar from '../common/Avatar';
import { Colors } from '../../constants/colors';

// ─── Props ────────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  onPress: () => void;
  onLike: (postId: string) => void;
  showImage?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffWeek < 4) return `${diffWeek}w ago`;
  return `${diffMonth}mo ago`;
}

const CONTENT_THRESHOLD = 160;

// ─── Component ────────────────────────────────────────────────────────────────

const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
  onLike,
  showImage = true,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isLong = post.content.length > CONTENT_THRESHOLD;
  const displayContent =
    expanded || !isLong
      ? post.content
      : post.content.slice(0, CONTENT_THRESHOLD).trimEnd() + '…';

  const hasImage =
    showImage && post.images != null && post.images.length > 0;
  const firstImage = hasImage ? post.images![0] : null;

  const handleLike = () => {
    const nowLiked = !liked;
    setLiked(nowLiked);
    setLikeCount(prev => (nowLiked ? prev + 1 : prev - 1));
    onLike(post._id);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Avatar
          name={post.author.name}
          uri={post.author.avatar}
          size={40}
          showBorder={false}
        />
        <View style={styles.headerMeta}>
          <View style={styles.headerTopRow}>
            <Text style={styles.authorName} numberOfLines={1}>
              {post.author.name}
            </Text>
            {post.category != null && post.category.length > 0 && (
              <View style={styles.stateBadge}>
                <Text style={styles.stateBadgeText}>{post.category}</Text>
              </View>
            )}
          </View>
          <Text style={styles.timeText}>• {timeAgo(post.createdAt)}</Text>
        </View>
      </View>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <View style={styles.contentBlock}>
        <Text style={styles.contentText} numberOfLines={expanded ? undefined : 3}>
          {displayContent}
        </Text>
        {isLong && !expanded && (
          <TouchableOpacity
            onPress={() => setExpanded(true)}
            hitSlop={styles.hitSlop}
          >
            <Text style={styles.readMore}>Read more</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Image ───────────────────────────────────────────────────────── */}
      {firstImage != null && (
        <Image
          source={{ uri: firstImage }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      {/* ── Tags ────────────────────────────────────────────────────────── */}
      {post.tags != null && post.tags.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tagsScroll}
          contentContainerStyle={styles.tagsContent}
        >
          {post.tags.map((tag, index) => (
            <View key={index} style={styles.tagPill}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <View style={styles.actionRow}>
        {/* Like */}
        <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
          <Text style={styles.actionEmoji}>{liked ? '❤️' : '🤍'}</Text>
          <Text style={styles.actionCount}>{likeCount}</Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.actionItem} onPress={onPress}>
          <Text style={styles.actionEmoji}>💬</Text>
          <Text style={styles.actionCount}>{post.comments}</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionItem}>
          <Text style={styles.actionEmoji}>↗️</Text>
        </TouchableOpacity>

        {/* Spacer pushes bookmark to the right */}
        <View style={styles.actionSpacer} />

        {/* Bookmark */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => setBookmarked(b => !b)}
        >
          <Text style={styles.actionEmoji}>{bookmarked ? '🔖' : '🏷️'}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerMeta: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginRight: 6,
  },
  stateBadge: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  stateBadgeText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 12,
    color: Colors.textMuted,
  },

  // Content
  contentBlock: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  contentText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  readMore: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
  hitSlop: {
    top: 6,
    bottom: 6,
    left: 0,
    right: 0,
  },

  // Image
  postImage: {
    width: '100%',
    height: 180,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginBottom: 4,
  },

  // Tags
  tagsScroll: {
    marginTop: 4,
  },
  tagsContent: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6,
  },
  tagPill: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18,
  },
  actionEmoji: {
    fontSize: 16,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  actionSpacer: {
    flex: 1,
  },
});

export default PostCard;
