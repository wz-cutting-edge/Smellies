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
  const [authorEmail, setAuthorEmail] = useState('Loading...');

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

  // Fetch author information when post is loaded
  useEffect(() => {
    async function fetchAuthorInfo() {
      if (post?.user_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, display_name')
          .eq('id', post.user_id)
          .single();
        
        if (profile) {
          setAuthorEmail(profile.display_name || profile.email || 'Unknown User');
        } else {
          setAuthorEmail(`User #${post.user_id.substring(0, 8)}`);
        }
      }
    }
    fetchAuthorInfo();
  }, [post?.user_id]);

  async function handleAddComment(e) {
    e.preventDefault();
    if (!user) return alert("Please login to comment!");
    if (!newComment.trim()) return;
    
    const { data: newCommentData, error } = await supabase
      .from("comments")
      .insert([{
        post_id: id,
        content: newComment.trim(),
        user_id: user.id,
      }])
      .select()
      .single();
      
    if (!error && newCommentData) {
      setComments(c => [...c, {
        ...newCommentData,
        upvotes: 0,
        downvotes: 0
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

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--mutedText)' }}>
      Loading...
    </div>
  );
  
  if (error) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#dc3545' }}>
      {error}
    </div>
  );

  const isOwner = user && user.id === post.user_id;

  return (
    <div className="post-container">
      <article 
        style={{
          background: 'var(--card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '3rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <header style={{ marginBottom: '2rem' }}>
          <h1 
            style={{
              color: 'var(--text)',
              fontSize: '2.5rem',
              fontWeight: 700,
              lineHeight: '1.2',
              marginBottom: '1rem'
            }}
          >
            {post.title}
          </h1>
          
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap',
              color: 'var(--mutedText)',
              fontSize: '0.9rem',
              marginBottom: '1rem'
            }}
          >
            <span>{new Date(post.creation_time).toLocaleDateString()}</span>
            <span>By: {authorEmail}</span>
          </div>

          {post.post_tags && post.post_tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {post.post_tags.map(pt => pt.tags?.name).filter(Boolean).map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    background: 'var(--primary)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.image_url && (
          <img 
            src={post.image_url} 
            alt="Post" 
            style={{
              width: '100%',
              maxWidth: '500px',
              height: 'auto',
              borderRadius: '8px',
              margin: '2rem 0',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
          />
        )}

        {post.content && (
          <div 
            style={{
              fontSize: '1.1rem',
              lineHeight: '1.7',
              color: 'var(--text)',
              marginBottom: '2rem',
              whiteSpace: 'pre-wrap'
            }}
          >
            {post.content}
          </div>
        )}

        <div 
          style={{
            display: 'flex',
            gap: '1rem',
            margin: '2rem 0'
          }}
        >
          <button 
            onClick={() => user ? handleVote('posts', post.id, 'upvotes', true) : alert('Login to vote!')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'var(--secondary)';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'var(--primary)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ▲ {post.upvotes}
          </button>
          
          <button 
            onClick={() => user ? handleVote('posts', post.id, 'downvotes', true) : alert('Login to vote!')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--background)',
              color: 'var(--text)',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'var(--mutedText)';
              e.target.style.color = 'white';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'var(--background)';
              e.target.style.color = 'var(--text)';
            }}
          >
            ▼ {post.downvotes}
          </button>
        </div>

        {isOwner && (
          <div 
            style={{
              display: 'flex',
              gap: '1rem',
              margin: '2rem 0',
              paddingTop: '2rem',
              borderTop: '1px solid var(--border)'
            }}
          >
            <button 
              onClick={() => navigate(`/edit/${post.id}`)}
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.background = 'var(--secondary)'}
              onMouseLeave={e => e.target.style.background = 'var(--primary)'}
            >
              Edit Post
            </button>
            
            <button 
              onClick={handleDelete}
              style={{
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.background = '#c82333'}
              onMouseLeave={e => e.target.style.background = '#dc3545'}
            >
              Delete Post
            </button>
          </div>
        )}
      </article>

      <section style={{ marginTop: '3rem' }}>
        <h3 
          style={{
            color: 'var(--primary)',
            fontSize: '1.5rem',
            fontWeight: 600,
            marginBottom: '2rem'
          }}
        >
          Comments ({comments.length})
        </h3>

        {user ? (
          <form 
            onSubmit={handleAddComment}
            style={{
              marginBottom: '3rem',
              background: 'var(--card)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              padding: '2rem'
            }}
          >
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              required
              rows="4"
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--text)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease',
                resize: 'vertical',
                fontFamily: 'inherit',
                marginBottom: '1rem'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button 
              type="submit"
              style={{
                background: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.target.style.background = 'var(--secondary)';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.target.style.background = 'var(--primary)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Post Comment
            </button>
          </form>
        ) : (
          <div 
            style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'var(--card)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              marginBottom: '3rem'
            }}
          >
            <p style={{ color: 'var(--mutedText)' }}>Please log in to comment</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {comments.map(comment => (
            <div
              key={comment.id}
              style={{
                background: 'var(--card)',
                borderRadius: '12px',
                border: '1px solid var(--border)',
                padding: '1.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <div 
                style={{
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  color: 'var(--text)',
                  marginBottom: '1rem'
                }}
              >
                {comment.content}
              </div>
              
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <span 
                  style={{
                    color: 'var(--mutedText)',
                    fontSize: '0.875rem'
                  }}
                >
                  {new Date(comment.creation_time).toLocaleString()}
                </span>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => user ? handleVote('comments', comment.id, 'upvotes', false) : alert('Login to vote!')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'var(--background)',
                      color: 'var(--primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = 'var(--primary)';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = 'var(--background)';
                      e.target.style.color = 'var(--primary)';
                    }}
                  >
                    ▲ {comment.upvotes ?? 0}
                  </button>
                  
                  <button 
                    onClick={() => user ? handleVote('comments', comment.id, 'downvotes', false) : alert('Login to vote!')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'var(--background)',
                      color: 'var(--mutedText)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.target.style.background = 'var(--mutedText)';
                      e.target.style.color = 'white';
                    }}
                    onMouseLeave={e => {
                      e.target.style.background = 'var(--background)';
                      e.target.style.color = 'var(--mutedText)';
                    }}
                  >
                    ▼ {comment.downvotes ?? 0}
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {comments.length === 0 && (
            <div 
              style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--mutedText)',
                background: 'var(--card)',
                borderRadius: '12px',
                border: '1px solid var(--border)'
              }}
            >
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DetailedPost;
