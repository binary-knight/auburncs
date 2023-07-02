import React from 'react';
import { Link } from 'react-router-dom';

const Blog = () => {
  // Sample blog data
  const blogEntries = [
    { id: 1, title: 'Blog Entry 1', content: 'This is the content of Blog Entry 1.' },
    { id: 2, title: 'Blog Entry 2', content: 'This is the content of Blog Entry 2.' },
    { id: 3, title: 'Blog Entry 3', content: 'This is the content of Blog Entry 3.' },
  ];

  return (
    <div className="blog">
      <h2>Blog Entries</h2>
      {blogEntries.map((entry) => (
        <div key={entry.id} className="blog-entry">
          <h3>{entry.title}</h3>
          <p>{entry.content}</p>
          <Link to={`/blog/${entry.id}`}>Read More</Link>
        </div>
      ))}
    </div>
  );
};

export default Blog;
