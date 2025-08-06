import { useState, useEffect } from "react";
import { supabase } from "../client.js";
import { useUser } from "../UserContext";
import { useParams, useNavigate } from "react-router-dom";

const DetailedPost = () => {
  const { id } = useParams();
  const user = useUser();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      let { data: postData, error: postErr } = await supabase
        .from("posts")
        .select(`
          *, 
          post_tags(tag_id, tags(name)), 
          user_id
        `)
        .eq("id", id)
        .single();
      if (postErr || !postData) {
        setError("Post not found!"); setLoading(false); return;
      }
      setPost(postData);

      let { data: commentData } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("creation_time", { ascending: true });
      setComments(commentData || []);
      setLoading(false);
    }
    fetchData();
  }, [id]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!user) return alert("Please login to comment!");
    if (!newComment.trim()) return;
    const { error } = await supabase.from("comments").insert([{
      post_id: id,
      content: newComment.trim(),
      user_id: user.id,
    }]);
    if (!error) {
      setComments(c => [...c, {
        content: newComment.trim(), creation_time: new Date().toISOString(), upvotes: 0, downvotes: 0, user_id: user.id
      }]);
      setNewComment("");
    }
  }

  async function handleVote(table, rowId, field, isPost) {
    let { data, error } = await supabase
      .from(table)
      .select(field)
      .eq("id", rowId)
      .single();
    if (error || !data) return alert('Error voting');
    const newValue = (data[field] ?? 0) + 1;
    const { error: updateError } = await supabase
      .from(table)
      .update({ [field]: newValue })
      .eq("id", rowId);
    if (updateError) return alert('Error updating vote');
    if (isPost) {
      setPost(p => ({ ...p, [field]: newValue }));
    } else {
      setComments(cs =>
        cs.map(c => c.id === rowId ? { ...c, [field]: newValue } : c)
      );
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete post? This cannot be undone!")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) navigate("/");
  }

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-error">{error}</div>;

  const isOwner = user && user.id === post.user_id;

  return (
    <div className="detailed-post post-detail-page">
      <h1 className="post-title">{post.title}</h1>
      <div className="post-meta">
        <span className="post-date">{new Date(post.creation_time).toLocaleString()}</span>
        <span className="post-author">By: {post.user_id}</span>
        <span className="post-tags">
          Tags: {post.post_tags && post.post_tags.map(pt => pt.tags?.name).filter(Boolean).join(", ")}
        </span>
      </div>
      {post.image_url && <img className="post-image" src={post.image_url} alt="Post" style={{ maxWidth: "300px" }} />}
      <p className="post-content">{post.content}</p>
      <div className="post-actions">
        <button className="vote-button upvote-button" onClick={() => user ? handleVote('posts', post.id, 'upvotes', true) : alert('Login to vote!')}>
          ▲ {post.upvotes}
        </button>
        <button className="vote-button downvote-button" onClick={() => user ? handleVote('posts', post.id, 'downvotes', true) : alert('Login to vote!')}>
          ▼ {post.downvotes}
        </button>
      </div>
      {isOwner && (
        <div className="owner-actions">
          <button className="edit-button" onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
          <button className="delete-button" onClick={handleDelete}>Delete</button>
        </div>
      )}

      <h3 className="comments-heading">Comments</h3>
      <ul className="comments-list">
        {comments.map(c => (
          <li className="comment-list-item" key={c.id}>
            <span className="comment-content">{c.content}</span>
            <span className="comment-date">— {new Date(c.creation_time).toLocaleString()}</span>
            <button className="vote-button upvote-button" onClick={() => user ? handleVote('comments', c.id, 'upvotes', false) : alert('Login to vote!')}>
              ▲ {c.upvotes ?? 0}
            </button>
            <button className="vote-button downvote-button" onClick={() => user ? handleVote('comments', c.id, 'downvotes', false) : alert('Login to vote!')}>
              ▼ {c.downvotes ?? 0}
            </button>
          </li>
        ))}
      </ul>
      {user ? (
        <form className="comment-form" onSubmit={handleAddComment}>
          <input
            className="form-input comment-input"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Leave a comment"
            required
          />
          <button className="form-button comment-submit" type="submit">Submit</button>
        </form>
      ) : (
        <div className="auth-warning">Please log in to comment.</div>
      )}
    </div>
  );
};

export default DetailedPost;