import React, { useEffect, useState } from "react";
import { supabase } from "../client";
import { Link } from 'react-router-dom';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [sortBy, setSortBy] = useState('creation_time');
  const [searchTitle, setSearchTitle] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    async function fetchTags() {
      const { data, error } = await supabase.from('tags').select('*');
      if (error) {
        console.error('Error fetching tags:', error);
      } else {
        setTags(data || []);
      }
    }
    fetchTags();
  }, []);

  useEffect(() => {
    async function fetchPosts() {
      let query = supabase
        .from('posts')
        .select('id, title, creation_time, upvotes, downvotes, post_tags(tag_id, tags(name))')
        .order(sortBy, { ascending: sortBy === 'upvotes' ? false : (sortBy === 'creation_time' ? false : true) });

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
    <div className="page-container">
      <div 
        style={{
          textAlign: 'center',
          marginBottom: '3rem',
          padding: '2rem 0'
        }}
      >
        <h1 
          style={{
            color: 'var(--primary)',
            fontSize: '3rem',
            fontWeight: 700,
            marginBottom: '1rem'
          }}
        >
          SMELLIES
        </h1>
        <p 
          style={{
            color: 'var(--mutedText)',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          The fragrance community where scent enthusiasts share reviews, discoveries, and aromatic adventures
        </p>
      </div>

      <div 
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'var(--card)',
          borderRadius: '12px',
          border: '1px solid var(--border)'
        }}
      >
        <input
          value={searchTitle}
          onChange={e => setSearchTitle(e.target.value)}
          placeholder="Search posts by title..."
          style={{
            minWidth: '250px',
            flex: 1,
            maxWidth: '300px',
            padding: '0.75rem 1rem',
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
        
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--background)',
            color: 'var(--text)',
            fontSize: '1rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="creation_time">Newest First</option>
          <option value="upvotes">Most Upvoted</option>
        </select>
        
        <select
          value={selectedTag}
          onChange={e => setSelectedTag(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '2px solid var(--border)',
            borderRadius: '8px',
            background: 'var(--background)',
            color: 'var(--text)',
            fontSize: '1rem',
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">All Categories</option>
          {tags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {posts.length === 0 ? (
          <div 
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--mutedText)',
              background: 'var(--card)',
              borderRadius: '12px',
              border: '1px solid var(--border)'
            }}
          >
            <h3 style={{ marginBottom: '1rem' }}>No posts found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '2rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Link 
                to={`/post/${post.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <h2 
                  style={{
                    color: 'var(--text)',
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    lineHeight: '1.3'
                  }}
                >
                  {post.title}
                </h2>
                
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem',
                    flexWrap: 'wrap',
                    color: 'var(--mutedText)',
                    fontSize: '0.9rem'
                  }}
                >
                  <span>{new Date(post.creation_time).toLocaleDateString()}</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'var(--primary)'
                      }}
                    >
                      ▲ {post.upvotes}
                    </span>
                    <span 
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        color: 'var(--mutedText)'
                      }}
                    >
                      ▼ {post.downvotes}
                    </span>
                  </div>
                  
                  {post.post_tags && post.post_tags.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {post.post_tags.map(pt => pt.tags?.name).filter(Boolean).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: 500
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Home;
