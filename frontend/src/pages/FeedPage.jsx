import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  Collapse
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Delete as DeleteIcon,
  Image as ImageIcon,
  ChatBubbleOutline
} from '@mui/icons-material';

const FeedPage = () => {
  const { user } = useAuthStore();
  const serverBaseUrl = useMemo(() => {
    const base = api.defaults.baseURL || '';
    return base.replace(/\/api\/?$/, '');
  }, []);

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [openComments, setOpenComments] = useState({});
  const [commentsByPost, setCommentsByPost] = useState({});
  const [commentsMetaByPost, setCommentsMetaByPost] = useState({});
  const [commentInputByPost, setCommentInputByPost] = useState({});
  const [commentLoadingByPost, setCommentLoadingByPost] = useState({});
  const [commentSubmittingByPost, setCommentSubmittingByPost] = useState({});
  const [commentErrorByPost, setCommentErrorByPost] = useState({});

  const fetchPosts = async (nextPage) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/posts', { params: { page: nextPage, limit: 10 } });
      setPosts(response.data?.data || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du chargement des posts';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(page);
  }, [page]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError('');

    const hasContent = content.trim().length > 0;
    if (!hasContent && !imageFile) {
      setError('Ajoute du texte ou une image pour créer un post.');
      return;
    }

    const formData = new FormData();
    if (title.trim()) formData.append('title', title.trim());
    if (description.trim()) formData.append('description', description.trim());
    if (hasContent) formData.append('content', content.trim());
    if (imageFile) formData.append('image', imageFile);

    setCreating(true);
    try {
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTitle('');
      setDescription('');
      setContent('');
      setImageFile(null);
      setFileInputKey((key) => key + 1);
      setPage(1);
      await fetchPosts(1);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la création du post';
      setError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleLike = async (postId) => {
    try {
      await api.post(`/posts/${postId}/like`);
      await fetchPosts(page);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors du like';
      setError(message);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      await fetchPosts(page);
    } catch (err) {
      const message = err.response?.data?.message || 'Erreur lors de la suppression';
      setError(message);
    }
  };

  const getId = (value) => (value && typeof value === 'object' ? value._id : value);

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
        Fil d'actualité
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Créer un post
          </Typography>
          <Box component="form" onSubmit={handleCreatePost}>
            <Stack spacing={2}>
              <TextField
                label="Titre (optionnel)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                label="Description (optionnelle)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <TextField
                label="Contenu"
                multiline
                minRows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                >
                  Ajouter une image
                  <input
                    key={fileInputKey}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </Button>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {imageFile ? imageFile.name : 'Aucune image sélectionnée'}
                </Typography>
              </Box>
              <Button
                type="submit"
                variant="contained"
                disabled={creating}
              >
                {creating ? <CircularProgress size={22} color="inherit" /> : 'Publier'}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
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
            const liked = user && likeIds.some((id) => id?.toString() === user.id);
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
                          {post.user?.username || 'Utilisateur'}
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

                    {post.title && (
                      <Typography variant="h6">{post.title}</Typography>
                    )}
                    {post.description && (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {post.description}
                      </Typography>
                    )}
                    {post.content && (
                      <Typography variant="body1">{post.content}</Typography>
                    )}

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

export default FeedPage;
