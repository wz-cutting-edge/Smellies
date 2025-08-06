import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../client.js";
import { useUser } from "../UserContext";

const tagCategories = [
  { label: "Type", group: ["question", "comment"] },
  { label: "Gender", group: ["for men", "for women", "for unisex"] },
  { label: "Tag", group: ["good blind", "bad blind", "layering", "maceration", "dupes"] }
];

const EditPost = () => {
  const { id } = useParams();
  const user = useUser();
  const navigate = useNavigate();

  const [form, setForm] = useState({ title: "", content: "", imageUrl: "", tags: {} });
  const [allTags, setAllTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalUserId, setOriginalUserId] = useState(null);

  useEffect(() => {
    async function fetchAll() {
      let { data: post, error } = await supabase
        .from('posts')
        .select('id, title, content, image_url, user_id, post_tags(tag_id, tags(name))')
        .eq('id', id)
        .single();
      if (error || !post) return navigate("/");

      setOriginalUserId(post.user_id);

      setForm({
        title: post.title || "",
        content: post.content || "",
        imageUrl: post.image_url || "",
        tags: (() => {
          let tagObj = {};
          tagCategories.forEach(cat => {
            let existing = (post.post_tags || []).find(pt => cat.group.includes(pt.tags?.name));
            if (existing) tagObj[cat.label] = existing.tags.name;
          });
          return tagObj;
        })()
      });

      let { data: tags } = await supabase.from('tags').select('*');
      setAllTags(tags || []);
      setLoading(false);
    }
    fetchAll();
  }, [id, navigate]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--mutedText)' }}>
      Loading...
    </div>
  );
  
  if (!user || user.id !== originalUserId) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: '#dc3545' }}>
      Not authorized to edit this post.
    </div>
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  
  function handleTagChange(category, value) {
    setForm(f => ({ ...f, tags: { ...f.tags, [category]: value } }));
  }
  
  async function handleSubmit(e) {
    e.preventDefault();
    await supabase.from('posts').update({
      title: form.title,
      content: form.content,
      image_url: form.imageUrl
    }).eq('id', id);

    await supabase.from('post_tags').delete().eq('post_id', id);
    let tagIds = [];
    for (const category of tagCategories) {
      const val = form.tags[category.label];
      if (val) {
        const tag = allTags.find(t => t.name === val);
        if (tag) tagIds.push(tag.id);
      }
    }
    for (const tagId of tagIds) {
      await supabase.from('post_tags').insert([{ post_id: id, tag_id }]);
    }
    navigate("/", { replace: true });
  }

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
          Edit Post
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
                flex: 1
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
              Save Changes
            </button>
            
            <button 
              type="button"
              onClick={() => navigate(`/post/${id}`)}
              style={{
                background: 'var(--background)',
                color: 'var(--text)',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 600,
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
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
