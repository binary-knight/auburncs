import React from 'react';
import { Helmet } from "react-helmet";
import './HomePage.css';

const HomePage = () => {
  const welcomeSections = [
    {
      title: 'Your Guide to the Auburn Online Computer Science Program',
      description: 'Our platform provides comprehensive information about the Auburn Online Computer Science program. From course descriptions to syllabi, we\'ve got you covered. Whether you\'re a prospective student exploring your options or a current student planning your next semester, our platform is here to help you make informed decisions.',
    },
    {
      title: 'Rate and Review Courses',
      description: 'We believe in the power of shared experiences. Our platform allows you to rate and review courses, providing valuable insights for your peers. By sharing your experiences, you\'re helping to create a transparent and supportive learning environment.',
    },
    {
      title: 'Connect with Your Peers',
      description: 'Join our Discord and Reddit communities to connect with fellow students, share resources, and engage in lively discussions. Whether you\'re looking for study tips, course recommendations, or just want to chat about the latest developments in computer science, our communities are the place to be.',
    },
    {
      title: 'Resources at Your Fingertips',
      description: 'We\'ve curated a list of external resources to support your learning journey. From textbooks to online tutorials, these resources can supplement your coursework and help you gain a deeper understanding of computer science concepts.',
    },
    {
      title: 'About the Auburn Online Computer Science Program',
      description: 'The Auburn Online Computer Science program is a dynamic and innovative online learning environment that merges traditional instructional methods with modern technology. The program is ranked among the top 10 online computer science degrees in the nation and is recognized for its quality and affordability.',
    },
    {
      title: 'Admission Criteria',
      description: 'Whether you are a transfer student or someone who has already completed a bachelor’s degree, the AUOCS program is designed to accommodate your needs. If you graduated with a GPA of 2.5 or higher (on a 4.0 scale), then you automatically fulfill all core requirements and can fast-track into the online BCS program.',
    },
    {
      title: 'Student Reviews',
      description: 'Students have praised the program for providing a strong orientation to the CS field, which has been instrumental in their success after graduation. The program is also recognized for its supportive staff who are committed to student success.',
    },
  ];

  return (
    <div className="homepage">
      <Helmet>
        <title>Auburn Online CS Student Portal</title>
        <meta name="description" content="Unofficial Auburn Online Computer Science Student Portal. A platform created for students, by students, to support your academic journey and foster a vibrant community of online learners." />
        <meta name="keywords" content="Auburn, Online, Computer Science, Student Portal, Course Reviews, Resources" />
      </Helmet>
      <h1 className="homepage-title">Welcome to the Unofficial Auburn Online Computer Science Student Portal</h1>
      <p className="homepage-intro">Welcome to your one-stop resource for all things related to the Auburn Online Computer Science program. This platform, created "For Students, By Students", is designed to support your academic journey and foster a vibrant community of online learners.</p>
      {welcomeSections.map((section, index) => (
        <div key={index} className="section">
          <h2 className="section-title">{section.title}</h2>
          <p className="section-description">{section.description}</p>
        </div>
      ))}
      <p className="homepage-closing">We invite you to join our community and make the most of your Auburn Online Computer Science program. Together, we can learn, grow, and succeed.</p>
    </div>
  );
};

export default HomePage;

