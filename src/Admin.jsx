import React, { useState } from 'react';

const Admin = () => {
  const [blogTitle, setBlogTitle] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [classTitle, setClassTitle] = useState('');
  const [classDescription, setClassDescription] = useState('');

  const handleBlogSubmit = (e) => {
    e.preventDefault();
    // Add logic to save the blog post to the backend
    console.log('Blog Title:', blogTitle);
    console.log('Blog Content:', blogContent);
    // Clear the input fields
    setBlogTitle('');
    setBlogContent('');
  };

  const handleClassSubmit = (e) => {
    e.preventDefault();
    // Add logic to save the class listing to the backend
    console.log('Class Title:', classTitle);
    console.log('Class Description:', classDescription);
    // Clear the input fields
    setClassTitle('');
    setClassDescription('');
  };

  return (
    <div className="admin">
      <h2>Admin Panel</h2>

      <div className="blog-form">
        <h3>Create Blog Post</h3>
        <form onSubmit={handleBlogSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
          />
          <textarea
            placeholder="Content"
            value={blogContent}
            onChange={(e) => setBlogContent(e.target.value)}
          ></textarea>
          <button type="submit">Create</button>
        </form>
      </div>

      <div className="class-form">
        <h3>Create Class Listing</h3>
        <form onSubmit={handleClassSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={classTitle}
            onChange={(e) => setClassTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            value={classDescription}
            onChange={(e) => setClassDescription(e.target.value)}
          ></textarea>
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default Admin;
