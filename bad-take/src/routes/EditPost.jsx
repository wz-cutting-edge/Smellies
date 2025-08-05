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

  if (loading) return <div>Loading...</div>;
  if (!user || user.id !== originalUserId) return <div>Not authorized.</div>;

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
    navigate(`/post/${id}`);
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
      <button type="submit">Save Changes</button>
    </form>
  );
};

export default EditPost;