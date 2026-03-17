import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { api, Post } from '../services/api';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/community/PostCard';
import EmptyState from '../components/common/EmptyState';
import Avatar from '../components/common/Avatar';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES: string[] = [
  'All',
  'Questions',
  'Tips',
  'Disease Reports',
  'Success Stories',
  'Market',
];

const POST_LIMIT = 10;
const MAX_CONTENT_LENGTH = 500;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

// ─── Error Banner ─────────────────────────────────────────────────────────────

interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => (
  <View style={styles.errorBanner}>
    <Text style={styles.errorBannerText} numberOfLines={2}>
      {message}
    </Text>
    <TouchableOpacity onPress={onRetry} style={styles.retryButton} activeOpacity={0.75}>
      <Text style={styles.retryButtonText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

// ─── Tag Pill ─────────────────────────────────────────────────────────────────

interface TagPillProps {
  label: string;
}

const TagPill: React.FC<TagPillProps> = ({ label }) => (
  <View style={styles.tagPill}>
    <Text style={styles.tagPillText}>#{label}</Text>
  </View>
);

// ─── Category Selector ────────────────────────────────────────────────────────

interface CategorySelectorProps {
  selected: string;
  onSelect: (cat: string) => void;
  options: string[];
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selected,
  onSelect,
  options,
}) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.categorySelectorContent}
  >
    {options.filter((c) => c !== 'All').map((cat) => (
      <TouchableOpacity
        key={cat}
        style={[
          styles.categorySelectorPill,
          selected === cat && styles.categorySelectorPillActive,
        ]}
        onPress={() => onSelect(cat)}
        activeOpacity={0.75}
      >
        <Text
          style={[
            styles.categorySelectorPillText,
            selected === cat && styles.categorySelectorPillTextActive,
          ]}
        >
          {cat}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// ─── Create Post Modal ────────────────────────────────────────────────────────

interface CreateModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  userName: string;
  userAvatar?: string;
}

const CreatePostModal: React.FC<CreateModalProps> = ({
  visible,
  onClose,
  onPostCreated,
  userName,
  userAvatar,
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Tips');
  const [tagsRaw, setTagsRaw] = useState('');
  const [creating, setCreating] = useState(false);

  const parsedTags = parseTags(tagsRaw);
  const charsLeft = MAX_CONTENT_LENGTH - content.length;
  const canPost = content.trim().length > 0 && !creating;

  const handleClose = useCallback(() => {
    if (creating) return;
    setContent('');
    setCategory('Tips');
    setTagsRaw('');
    onClose();
  }, [creating, onClose]);

  const handlePost = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setCreating(true);
    try {
      const response = await api.createPost({
        content: trimmed,
        category,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
      });
      onPostCreated(response.post);
      setContent('');
      setCategory('Tips');
      setTagsRaw('');
      onClose();
    } catch (err: any) {
      Alert.alert(
        'Failed to post',
        err?.message || 'Something went wrong. Please try again.',
      );
    } finally {
      setCreating(false);
    }
  }, [content, category, parsedTags, onPostCreated, onClose]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={handleClose}
            activeOpacity={0.7}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.modalTitle}>Create Post</Text>

          <TouchableOpacity
            style={[
              styles.modalPostButton,
              !canPost && styles.modalPostButtonDisabled,
            ]}
            onPress={handlePost}
            disabled={!canPost}
            activeOpacity={0.8}
          >
            {creating ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text
                style={[
                  styles.modalPostButtonText,
                  !canPost && styles.modalPostButtonTextDisabled,
                ]}
              >
                Post
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.modalScrollArea}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Author Row */}
          <View style={styles.modalAuthorRow}>
            <Avatar name={userName} uri={userAvatar} size={44} showBorder />
            <View style={styles.modalAuthorInfo}>
              <Text style={styles.modalAuthorName}>{userName}</Text>
              <Text style={styles.modalAuthorTag}>Posting to Farm Community</Text>
            </View>
          </View>

          {/* Category Selector */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionLabel}>Category</Text>
            <CategorySelector
              selected={category}
              onSelect={setCategory}
              options={CATEGORIES}
            />
          </View>

          {/* Content Input */}
          <TextInput
            style={styles.modalContentInput}
            value={content}
            onChangeText={setContent}
            placeholder="What's on your mind about farming?"
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={MAX_CONTENT_LENGTH}
            autoFocus
            textAlignVertical="top"
          />

          {/* Tags Input */}
          <View style={styles.modalSection}>
            <TextInput
              style={styles.modalTagsInput}
              value={tagsRaw}
              onChangeText={setTagsRaw}
              placeholder="Add tags (comma separated)"
              placeholderTextColor={Colors.textMuted}
            />
            {parsedTags.length > 0 && (
              <View style={styles.tagsPreviewRow}>
                {parsedTags.map((tag) => (
                  <TagPill key={tag} label={tag} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Bottom Toolbar */}
        <View style={styles.modalToolbar}>
          <TouchableOpacity
            style={styles.toolbarImageButton}
            activeOpacity={0.7}
            onPress={() =>
              Alert.alert('Coming Soon', 'Image upload will be available soon.')
            }
          >
            <Text style={styles.toolbarImageIcon}>🖼️</Text>
            <Text style={styles.toolbarImageLabel}>Photo</Text>
          </TouchableOpacity>

          <Text
            style={[
              styles.charCount,
              charsLeft < 50 && styles.charCountWarning,
              charsLeft < 0 && styles.charCountError,
            ]}
          >
            {content.length}/{MAX_CONTENT_LENGTH}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const CommunityScreen: React.FC = () => {
  const navigation = useNavigation();
  const { state: authState } = useAuth();

  // Posts state
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isFetchingMore = useRef(false);

  // ── Fetch Posts ────────────────────────────────────────────────────────────

  const fetchPosts = useCallback(
    async (pageNum: number, replace: boolean) => {
      if (loading && !replace) return;
      if (!hasMore && !replace) return;

      if (replace) {
        setLoading(true);
        setError(null);
      } else {
        isFetchingMore.current = true;
      }

      try {
        const response = await api.getPosts({
          page: pageNum,
          limit: POST_LIMIT,
        });

        const incoming = response.posts ?? [];
        const total = response.total ?? 0;

        setPosts((prev) => {
          const next = replace ? incoming : [...prev, ...incoming];
          setHasMore(next.length < total && incoming.length === POST_LIMIT);
          return next;
        });
      } catch (err: any) {
        setError(err?.message || 'Failed to load posts. Please try again.');
      } finally {
        setLoading(false);
        isFetchingMore.current = false;
      }
    },
    [loading, hasMore],
  );

  // Initial load
  useEffect(() => {
    fetchPosts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load more when page increments
  useEffect(() => {
    if (page > 1) {
      fetchPosts(page, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ── Refresh ────────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    setError(null);
    try {
      const response = await api.getPosts({ page: 1, limit: POST_LIMIT });
      const incoming = response.posts ?? [];
      const total = response.total ?? 0;
      setPosts(incoming);
      setHasMore(incoming.length < total && incoming.length === POST_LIMIT);
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh posts.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  // ── Load More ──────────────────────────────────────────────────────────────

  const handleEndReached = useCallback(() => {
    if (!isFetchingMore.current && hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, loading]);

  // ── Like Post (Optimistic) ─────────────────────────────────────────────────

  const handleLike = useCallback(async (postId: string) => {
    setPosts((prev) =>
      prev.map((p) =>
        p._id === postId ? { ...p, likes: p.likes + 1 } : p,
      ),
    );
    try {
      const response = await api.likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: response.likes } : p,
        ),
      );
    } catch {
      // Revert optimistic update on failure
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: Math.max(0, p.likes - 1) } : p,
        ),
      );
    }
  }, []);

  // ── Post Created ───────────────────────────────────────────────────────────

  const handlePostCreated = useCallback((post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setShowCreateModal(false);
  }, []);

  // ── Category Filter (local) ────────────────────────────────────────────────

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(
        (p) =>
          (p.category ?? '').toLowerCase() === selectedCategory.toLowerCase(),
      );

  const searchFilteredPosts =
    searchQuery.trim().length > 0
      ? filteredPosts.filter((p) =>
          p.content.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : filteredPosts;

  // ── Render Item ────────────────────────────────────────────────────────────

  const renderPost = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        onLike={() => handleLike(item._id)}
        onPress={() =>
          (navigation as any).navigate('PostDetail', { postId: item._id })
        }
      />
    ),
    [handleLike, navigation],
  );

  const keyExtractor = useCallback((item: Post) => item._id, []);

  const ListFooter = loading && !refreshing ? (
    <View style={styles.footerLoader}>
      <ActivityIndicator size="small" color={Colors.accent} />
    </View>
  ) : null;

  const ListEmpty = !loading ? (
    <EmptyState
      icon="👥"
      title="No posts yet"
      subtitle="Be the first to share your farming experience!"
      actionLabel="Create Post"
      onAction={() => setShowCreateModal(true)}
    />
  ) : null;

  const userName = authState.user?.name ?? 'Farmer';
  const userAvatar = authState.user?.avatar;

  return (
    <View style={styles.container}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.headerTitle}>Farm Community</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerIconButton}
              activeOpacity={0.7}
              onPress={() => {
                /* search toggle – future enhancement */
              }}
            >
              <Text style={styles.headerIconText}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.7}>
              <Text style={styles.headerIconText}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── Error Banner ────────────────────────────────────────────────────── */}
      {error !== null && (
        <ErrorBanner message={error} onRetry={() => fetchPosts(1, true)} />
      )}

      {/* ── Category Filter Tabs ─────────────────────────────────────────────── */}
      <View style={styles.filterTabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterTabsScrollContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={styles.filterTab}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedCategory === cat && styles.filterTabTextActive,
                ]}
              >
                {cat}
              </Text>
              {selectedCategory === cat && (
                <View style={styles.filterTabActiveBar} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Post List ────────────────────────────────────────────────────────── */}
      {loading && posts.length === 0 ? (
        <View style={styles.initialLoader}>
          <ActivityIndicator size="large" color={Colors.accent} />
          <Text style={styles.initialLoaderText}>Loading posts...</Text>
        </View>
      ) : (
        <FlatList
          data={searchFilteredPosts}
          renderItem={renderPost}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.accent]}
              tintColor={Colors.accent}
            />
          }
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* ── FAB ──────────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* ── Create Post Modal ────────────────────────────────────────────────── */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
        userName={userName}
        userAvatar={userAvatar}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    color: Colors.textInverse,
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    marginLeft: 12,
    padding: 4,
  },
  headerIconText: {
    fontSize: 20,
    color: Colors.textInverse,
  },

  // Error Banner
  errorBanner: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  errorBannerText: {
    flex: 1,
    color: Colors.textInverse,
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    marginLeft: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.textInverse,
  },
  retryButtonText: {
    color: Colors.textInverse,
    fontSize: 13,
    fontWeight: '600',
  },

  // Filter Tabs
  filterTabsContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterTabsScrollContent: {
    paddingHorizontal: 4,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  filterTabText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  filterTabActiveBar: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: Colors.accent,
    borderRadius: 1,
  },

  // Post List
  listContent: {
    paddingTop: 8,
    paddingBottom: 96,
    flexGrow: 1,
  },
  initialLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  initialLoaderText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textMuted,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 88,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    color: Colors.textInverse,
    fontSize: 28,
    fontWeight: '400',
    lineHeight: 32,
    marginTop: -2,
  },

  // Create Modal
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalPostButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    minWidth: 60,
    alignItems: 'center',
  },
  modalPostButtonDisabled: {
    backgroundColor: Colors.border,
  },
  modalPostButtonText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  modalPostButtonTextDisabled: {
    color: Colors.textMuted,
  },
  modalScrollArea: {
    flex: 1,
  },
  modalAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  modalAuthorInfo: {
    marginLeft: 12,
  },
  modalAuthorName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalAuthorTag: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  modalSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  modalSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  modalContentInput: {
    flex: 1,
    minHeight: 160,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    lineHeight: 24,
  },
  modalTagsInput: {
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.background,
  },
  tagsPreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tagPill: {
    backgroundColor: Colors.accentSoft,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
  },
  tagPillText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  modalToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  toolbarImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toolbarImageIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  toolbarImageLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  charCount: {
    marginLeft: 'auto',
    fontSize: 13,
    color: Colors.textMuted,
  },
  charCountWarning: {
    color: Colors.warning,
  },
  charCountError: {
    color: Colors.error,
  },

  // Category Selector (modal)
  categorySelectorContent: {
    paddingRight: 8,
  },
  categorySelectorPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
    backgroundColor: Colors.surface,
  },
  categorySelectorPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categorySelectorPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categorySelectorPillTextActive: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
});

export default CommunityScreen;
