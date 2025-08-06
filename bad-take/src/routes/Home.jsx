import React, { useEffect, useState } from "react";
import { supabase } from "../client";
import { Link } from 'react-router-dom';

const Home = () =>{
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [sortBy, setSortBy] = useState('creation_time');
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    supabase.from('tags').select('*').then(({data}) => setTags(data));
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      let query = supabase
        .from('posts')
        .select('id, title, creation_time, upvotes, downvotes, post_tags(tag_id, tags(name))')
        .order(sortBy, { ascending: sortBy === 'creation_time' ? false : true });

      if (searchTitle) {
        query = query.ilike('title', `%${searchTitle}%`);
      }

      if (selectedTag) {
        const { data: postTagData, error: ptError } = await supabase
          .from('post_tags')
          .select('post_id')
          .eq('tag_id', selectedTag);

        if (ptError) {
          console.error(ptError);
          return;
        }

        const postIds = postTagData.map(pt => pt.post_id);
        if (postIds.length > 0) {
          query = query.in('id', postIds);
        } else {
          setPosts([]);
          return;
        }
      }
      const { data, error } = await query;
      if (!error) setPosts(data);
    }
    fetchPosts();
  }, [sortBy, searchTitle, selectedTag]);

  return (
    <div className="home">
      <div className="filters filters-bar">
        <input
          className="filter-input"
          value={searchTitle}
          onChange={e => setSearchTitle(e.target.value)}
          placeholder="Search posts by title"
        />
        <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="creation_time">Newest</option>
          <option value="upvotes">Most Upvoted</option>
        </select>
        <select
          className="filter-select"
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

      <ul className="post-home post-list">
        {posts.map(post => (
          <li key={post.id} className="post-list-item">
            <Link to={`/post/${post.id}`} className="post-link">
              <h2 className="post-title">{post.title}</h2>
            </Link>
            <div className="post-data post-meta">
              <span className="post-date">{new Date(post.creation_time).toLocaleString()}</span>
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

export default Home;
