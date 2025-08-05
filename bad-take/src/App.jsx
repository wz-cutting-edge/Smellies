import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [sortBy, setSortBy] = useState('creation_time');
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    supabase.from('tags').select('*').then(({data}) => setTags(data));
  }, []);
  useEffect(() => {
    let query = supabase
    .from('posts')
    .select(
      'id, title, creation_time, upvotes, downvotes, post_tags!inner(tag_id, tags(name))'
    )
    .order(sortBy, {ascending: sortBy === 'creation_time' ? false : true});
    if (searchTitle) {
      query = query.ilike('title', `%${searchTitle}`);
    }
    if (selectedTag) {
      query = query
        .in('id', 
          supabase
            .from('post_tags')
            .select('post_id')
            .eq('tag_id', selectedTag)
        );
    }
    query.then(({data, error}) =>{
      if (data) setPosts(data);
    });
  }, [sortBy, searchTitle, selectTag]);
  return (
    <div className="home">
      <div className="filters">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search posts by title"
        />

        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="creation_time">Newest</option>
          <option value="upvotes">Most Upvoted</option>
        </select>

        <select
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
        >
          <option value="">All Tags</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="post-home">
        {posts.map(post => (
          <li key={post.id} className="post-list-item">
            <a href={`/post/${post.id}`}>
              <h2>{post.title}</h2>
            </a>
            <div className="post-data">
              <span>{new Date(post.creation_time).toLocaleString()}</span>
              <span className="upvotes">▲ {post.upvotes}</span>
              <span className="downvotes">▼ {post.downvotes}</span>
              {post.post_tags && (
                <span className="post-tags">
                  {post.post_tags.map(pt => pt.tags?.name).filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App
