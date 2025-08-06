import { supabase } from '../client.js';
import { useUser} from '../UserContext.jsx';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const tagCategories = [
    {label: 'Type', group: ['question', 'comment']},
    {label: 'Gender', group: ['for men', 'for women', 'for unisex']},
    {label: 'Tag', group: ["good blind", "bad blind", "layering", "maceration", "dupes"]}
]

const CreatePost = () => {
  const user = useUser();
  const navigate = useNavigate();
  const [form, setForm] = useState({title:"", content:"", imageUrl:"", tags: {}});
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    supabase.from('tags').select('*').then(({data}) => setAllTags(data));
  }, []);

  function handleChange(e) {
    const {name, value} = e.target;
    setForm(f => ({...f, [name]: value}));
  }

  function handleTagChange(category, value) {
    setForm(f => ({
      ...f,
      tags: {
        ...f.tags,
        [category]: value
      }
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { data: post, error } = await supabase.from('posts').insert([
      {
        title: form.title,
        content: form.content,
        image_url: form.imageUrl,
        user_id: user.id,
      }
    ]).select().single();

    if (error) return alert("Error creating post");

    let tagIds = [];
    for (const category of tagCategories) {
      const val = form.tags[category.label];
      if (val) {
        const tag = allTags.find(t => t.name === val);
        if (tag) tagIds.push(tag.id);
      }
    }
    for (const tagId of tagIds) {
      await supabase.from('post_tags').insert([{ post_id: post.id, tag_id }]);
    }

    navigate("/");
  }

  if (!user) return (
    <div 
      style={{
        textAlign: 'center',
        padding: '4rem 2rem',
        color: 'var(--mutedText)'
      }}
    >
      <h2>Please log in to create a post</h2>
    </div>
  );

  return (
    <div className="page-container">
      <div 
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          background: 'var(--card)',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          padding: '2.5rem',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <h1 
          style={{
            color: 'var(--primary)',
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '2rem',
            textAlign: 'center'
          }}
        >
          Create New Post
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label 
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--text)'
              }}
            >
              Title *
            </label>
            <input 
              required 
              name="title" 
              value={form.title} 
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--text)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              placeholder="Enter your post title..."
            />
          </div>

          <div>
            <label 
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--text)'
              }}
            >
              Content
            </label>
            <textarea 
              name="content" 
              value={form.content} 
              onChange={handleChange}
              rows="6"
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
                fontFamily: 'inherit'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              placeholder="Share your thoughts, experiences, or questions..."
            />
          </div>

          <div>
            <label 
              style={{
                display: 'block',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--text)'
              }}
            >
              Image URL (optional)
            </label>
            <input 
              name="imageUrl" 
              value={form.imageUrl} 
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '1rem',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--background)',
                color: 'var(--text)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {tagCategories.map(cat => (
            <div key={cat.label}>
              <label 
                style={{
                  display: 'block',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text)'
                }}
              >
                {cat.label}
              </label>
              <select
                value={form.tags[cat.label] || ""}
                onChange={e => handleTagChange(cat.label, e.target.value)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  border: '2px solid var(--border)',
                  borderRadius: '8px',
                  background: 'var(--background)',
                  color: 'var(--text)',
                  fontSize: '1rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">None</option>
                {cat.group.map(tagVal => (
                  <option key={tagVal} value={tagVal}>{tagVal}</option>
                ))}
              </select>
            </div>
          ))}

          <button 
            type="submit"
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginTop: '1rem'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'var(--secondary)';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'var(--primary)';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            Create Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
