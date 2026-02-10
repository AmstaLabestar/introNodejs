import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  IconButton,
  TextField,
  Collapse
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Delete as DeleteIcon,
  ChatBubbleOutline
} from '@mui/icons-material';

const ProfilePage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();

  const serverBaseUrl = useMemo(() => {
    const base = api.defaults.baseURL || '';
    return base.replace(/\/api\/?$/, '');
  }, []);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [openComments, setOpenComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsMetaByPost, setCommentsMetaByPost] = useState({});
  const [commentInputByPost, setCommentInputByPost] = useState({});
  const [commentLoadingByPost, setCommentLoadingByPost] = useState({});
  const [commentSubmittingByPost, setCommentSubmittingByPost] = useState({});
  const [commentErrorByPost, setCommentErrorByPost] = useState({});

  const getId = (value) => (value && typeof value === 'object' ? value._id : value);

  const loadProfile = async () => {
    setLoadingProfile(true);
    setError('');
    try {
      const response = await api.get(`/auth/${id}`);
      const data = response.data;
      setProfile(data);
      const followerIds = (data.followers || []).map((f) => f.toString());
      setIsFollowing(followerIds.includes(user?.id));
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du chargement du profil';
      setError(message);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadPosts = async (nextPage) => {
    setLoadingPosts(true);
    setError('');
    try {
      const response = await api.get(`/posts/user/${id}`, { params: { page: nextPage, limit: 10 } });
      setPosts(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des posts';
      setError(message);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    setPage(1);
    loadProfile();
    loadPosts(1);
  }, [id]);

  useEffect(() => {
    if (id) {
      loadPosts(page);
    }
  }, [page]);

  const handleFollowToggle = async () => {
    if (!id || !user || id === user.id) return;

    setFollowingLoading(true);
    try {
      if (isFollowing) {
        await api.delete(`/auth/${id}/follow`);
        setIsFollowing(false);
        setProfile((prev) => ({
          ...prev,
          followers: (prev?.followers || []).filter((f) => f.toString() !== user.id)
        }));
      } else {
        await api.post(`/auth/${id}/follow`);
        setIsFollowing(true);
        setProfile((prev) => ({
          ...prev,
          followers: [...(prev?.followers || []), user.id]
        }));
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du suivi';
      setError(message);
    } finally {
      setFollowingLoading(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      await loadPosts(page);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du like';
      setError(message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      await loadPosts(page);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(message);
    }
  };

  const isOwnProfile = user?.id === id;

  const loadComments = async (postId) => {
    setCommentLoadingByPost((prev) => ({ ...prev, [postId]: true }));
    setCommentErrorByPost((prev) => ({ ...prev, [postId]: '' }));
    try {
      const response = await api.get(`/posts/${postId}`);
      const comments = (response.data?.comments || []).slice().reverse();
      setCommentsByPost((prev) => ({ ...prev, [postId]: comments }));
      setCommentsMetaByPost((prev) => ({
        ...prev,
        [postId]: { count: response.data?.commentsCount ?? comments.length }
      }));
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des commentaires';
      setCommentErrorByPost((prev) => ({ ...prev, [postId]: message }));
    } finally {
      setCommentLoadingByPost((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = async (postId) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    if (!commentsByPost[postId]) {
      await loadComments(postId);
    }
  };

  const handleAddComment = async (postId) => {
    const contentValue = (commentInputByPost[postId] || '').trim();
    if (!contentValue) return;
    setCommentSubmittingByPost((prev) => ({ ...prev, [postId]: true }));
    try {
      await api.post('/comments', { content: contentValue, post: postId });
      setCommentInputByPost((prev) => ({ ...prev, [postId]: '' }));
      await loadComments(postId);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de l\'envoi du commentaire';
      setCommentErrorByPost((prev) => ({ ...prev, [postId]: message }));
    } finally {
      setCommentSubmittingByPost((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      await loadComments(postId);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression du commentaire';
      setCommentErrorByPost((prev) => ({ ...prev, [postId]: message }));
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h2" sx={{ mb: 3, color: 'primary.main' }}>
        Profil
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loadingProfile ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : profile ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">{profile.username}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {profile.email}
                  </Typography>
                </Box>
                {!isOwnProfile && (
                  <Button
                    variant={isFollowing ? 'outlined' : 'contained'}
                    onClick={handleFollowToggle}
                    disabled={followingLoading}
                  >
                    {followingLoading
                      ? '...'
                      : isFollowing
                        ? 'Se désabonner'
                        : 'Suivre'}
                  </Button>
                )}
              </Box>

              <Divider />

              <Box sx={{ display: 'flex', gap: 4 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Abonnés
                  </Typography>
                  <Typography variant="h6">{profile.followers?.length || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Abonnements
                  </Typography>
                  <Typography variant="h6">{profile.following?.length || 0}</Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {loadingPosts ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {posts.length === 0 && (
            <Card>
              <CardContent>
                <Typography>Aucun post pour l’instant.</Typography>
              </CardContent>
            </Card>
          )}

          {posts.map((post) => {
            const likeIds = (post.likes || []).map((like) => getId(like));
            const liked = user && likeIds.some((item) => item?.toString() === user.id);
            const ownerId = getId(post.user);
            const canDelete = user && ownerId && ownerId.toString() === user.id;
            const imageUrl = post.imageUrl
              ? (post.imageUrl.startsWith('http')
                ? post.imageUrl
                : `${serverBaseUrl}${post.imageUrl}`)
              : null;
            const comments = commentsByPost[post._id] || [];
            const commentsCount = commentsMetaByPost[post._id]?.count;

            return (
              <Card key={post._id}>
                <CardContent>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {post.user?.username || profile?.username}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) : ''}
                        </Typography>
                      </Box>
                      {canDelete && (
                        <IconButton color="error" onClick={() => handleDeletePost(post._id)}>
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Box>

                    {post.title && <Typography variant="h6">{post.title}</Typography>}
                    {post.description && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {post.description}
                      </Typography>
                    )}
                    {post.content && <Typography variant="body1">{post.content}</Typography>}

                    {imageUrl && (
                      <Box
                        component="img"
                        src={imageUrl}
                        alt="Post"
                        sx={{
                          width: '100%',
                          maxHeight: 420,
                          objectFit: 'cover',
                          borderRadius: 2,
                          mt: 1
                        }}
                      />
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconButton color={liked ? 'error' : 'default'} onClick={() => handleToggleLike(post._id)}>
                        {liked ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>
                      <Typography variant="body2">{likeIds.length} like(s)</Typography>
                      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                      <IconButton onClick={() => toggleComments(post._id)}>
                        <ChatBubbleOutline />
                      </IconButton>
                      <Typography variant="body2">
                        {typeof commentsCount === 'number' ? `${commentsCount} commentaire(s)` : 'Commenter'}
                      </Typography>
                    </Box>

                    <Collapse in={openComments[post._id]} timeout="auto" unmountOnExit>
                      <Box sx={{ mt: 2 }}>
                        {commentErrorByPost[post._id] && (
                          <Typography variant="body2" color="error" sx={{ mb: 1 }}>
                            {commentErrorByPost[post._id]}
                          </Typography>
                        )}

                        {commentLoadingByPost[post._id] ? (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                            <CircularProgress size={20} />
                          </Box>
                        ) : (
                          <Stack spacing={1}>
                            {comments.length === 0 && (
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Aucun commentaire pour le moment.
                              </Typography>
                            )}
                            {comments.map((comment) => {
                              const canDeleteComment = user
                                && getId(comment.author)?.toString() === user.id;
                              return (
                                <Box
                                  key={comment._id}
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: 'grey.100'
                                  }}
                                >
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle2">
                                      {comment.author?.username || 'Utilisateur'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        {comment.createdAt
                                          ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
                                          : ''}
                                      </Typography>
                                      {canDeleteComment && (
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={() => handleDeleteComment(post._id, comment._id)}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      )}
                                    </Box>
                                  </Box>
                                  <Typography variant="body2">{comment.content}</Typography>
                                </Box>
                              );
                            })}
                          </Stack>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Écrire un commentaire..."
                            value={commentInputByPost[post._id] || ''}
                            onChange={(e) =>
                              setCommentInputByPost((prev) => ({ ...prev, [post._id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(post._id);
                              }
                            }}
                          />
                          <Button
                            variant="contained"
                            disabled={commentSubmittingByPost[post._id]}
                            onClick={() => handleAddComment(post._id)}
                          >
                            {commentSubmittingByPost[post._id] ? '...' : 'Commenter'}
                          </Button>
                        </Box>
                      </Box>
                    </Collapse>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {pagination && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            disabled={!pagination.hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Précédent
          </Button>
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            Page {pagination.page} / {pagination.totalPages}
          </Typography>
          <Button
            variant="outlined"
            disabled={!pagination.hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Suivant
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ProfilePage;
