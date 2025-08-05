import { supabase } from '../client.js';
import { useUser} from '../UserContext.jsx';
import { useState, useEffect } from 'react';

const tagCategories = [
    {label: 'Type', group: ['question', 'comment']},
    {label: 'Gender', group: ['for men', 'for women', 'for unisex']},
    {label: 'Tag', group: ["good blind", "bad blind", "layering", "maceration", "dupes"]}
]

const CreatePost = () => {
  const user = useUser();
  const [form, setForm] = useState({title:"", content:"", imageUrl:"", tags: {}});
  const [allTags, setAllTags] = useState([]);

  useEffect(() => {
    supabase.from('tags').select('*').then(({data}) => setAllTags(data));
  }, []);

  if (!user) return <div>Please log in to create a post.</div>;

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

    window.location.href = "/";
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>Title*<input required name="title" value={form.title} onChange={handleChange} /></label>
      <label>Content<textarea name="content" value={form.content} onChange={handleChange} /></label>
      <label>Image URL<input name="imageUrl" value={form.imageUrl} onChange={handleChange} /></label>
      {tagCategories.map(cat => (
        <div key={cat.label}>
          <span>{cat.label}:</span>
          <select
            value={form.tags[cat.label] || ""}
            onChange={e => handleTagChange(cat.label, e.target.value)}
          >
            <option value="">None</option>
            {cat.group.map(tagVal => (
              <option key={tagVal} value={tagVal}>{tagVal}</option>
            ))}
          </select>
        </div>
      ))}
      <button type="submit">Create Post</button>
    </form>
  );
};

export default CreatePost;
