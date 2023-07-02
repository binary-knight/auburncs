import React from 'react';
import Header from './Header';
import Blog from './Blog';
import ClassDetail from './ClassDetail';

const Home = () => {
  return (
    <div className="home">
      <Header />
      <div className="content">
        <div className="left-column">
          <Blog />
        </div>
        <div className="right-column">
          <ClassDetail />
        </div>
      </div>
    </div>
  );
};

export default Home;


