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
    await supabase
      .from(table)
      .update({ [field]: supabase.literal(`${field} + 1`) })
      .eq("id", rowId);
    if (isPost) setPost(p => ({ ...p, [field]: p[field] + 1 }));
    else setComments(cs =>
      cs.map(c =>
        c.id === rowId ? { ...c, [field]: c[field] + 1 } : c
      )
    );
  }

  async function handleDelete() {
    if (!window.confirm("Delete post? This cannot be undone!")) return;
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) navigate("/");
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const isOwner = user && user.id === post.user_id;

  return (
    <div className="detailed-post">
      <h1>{post.title}</h1>
      <div>
        <span>{new Date(post.creation_time).toLocaleString()}</span>
        <span>By: {post.user_id}</span>
        <span>Tags: {post.post_tags && post.post_tags.map(pt => pt.tags?.name).filter(Boolean).join(", ")}</span>
      </div>
      {post.image_url && <img src={post.image_url} alt="Post" style={{ maxWidth: "300px" }} />}
      <p>{post.content}</p>
      <div>
        <button onClick={() => user ? handleVote('posts', post.id, 'upvotes', true) : alert('Login to vote!')}>▲ {post.upvotes}</button>
        <button onClick={() => user ? handleVote('posts', post.id, 'downvotes', true) : alert('Login to vote!')}>▼ {post.downvotes}</button>
      </div>
      {isOwner && (
        <>
          <button onClick={() => navigate(`/edit/${post.id}`)}>Edit</button>
          <button onClick={handleDelete}>Delete</button>
        </>
      )}

      <h3>Comments</h3>
      <ul>
        {comments.map(c => (
          <li key={c.id}>
            <span>{c.content}</span>
            <span>— {new Date(c.creation_time).toLocaleString()}</span>
            <button onClick={() => user ? handleVote('comments', c.id, 'upvotes', false) : alert('Login to vote!')}>▲ {c.upvotes ?? 0}</button>
            <button onClick={() => user ? handleVote('comments', c.id, 'downvotes', false) : alert('Login to vote!')}>▼ {c.downvotes ?? 0}</button>
          </li>
        ))}
      </ul>
      {user ? (
        <form onSubmit={handleAddComment}>
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Leave a comment"
            required
          />
          <button type="submit">Submit</button>
        </form>
      ) : (
        <div>Please log in to comment.</div>
      )}
    </div>
  );
};

export default DetailedPost;