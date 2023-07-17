import React from 'react';
import './resources.css';

const Resources = () => {
  const softwareResources = [
    {
      title: 'Adobe Creative Cloud',
      description: 'Adobe Creative Cloud has a ton of software for students, for free.',
      link: 'http://ocm.auburn.edu/newsroom/news_articles/2018/08/130936-adobe-creative-cloud.php?nltwa',
    },
    {
      title: 'Auburn Engineering Software Link',
      description: 'Auburn Engineering Software Link (includes links to Microsft Azure Services and Microsoft Products like Office',
      link: 'https://imapssl.eng.auburn.edu/software/front.php',
    },
    {
      title: 'Github Education Pack',
      description: 'Github Education Pack for Students (IntelliJ IDE student  upgrades found here too!',
      link: 'https://education.github.com/pack',
    },
    {
      title: 'Amazon Web Services',
      description: 'AWS offers $150 in credits for students to learn one of the hottest and most lucrative cloud computing skills!',
      link: 'https://www.awseducate.com/',
    },
  ];

  const externalLearningResources = [
    {
      title: 'Java Masterclass on Udemy',
      description: 'This is an excellent class that covers not only Java, but the IntelliJ IDE in-depth.',
      link: 'https://www.udemy.com/java-the-complete-java-developer-course/',
    },
    {
      title: 'Web Development (HTML, CSS, Javacsript, Node.js)',
      description: 'This course covers all the good stuff that made this website possible.',
      link: 'https://www.udemy.com/course/the-complete-web-development-bootcamp/',
    },
    {
      title: 'Python Masterclass',
      description: 'An outstanding course on python!',
      link: 'https://www.udemy.com/complete-python-bootcamp/',
    },
    {
      title: 'TrevTutor (Discrete Math Help)',
      description: 'TrevTutor has a bunch of free and paid classes covering Discrete Math.  He has helped many a computer science student!',
      link: 'https://trevtutor.com/',
    },
  ];

  return (
    <div className="resources">
      <div className="software-section">
        <h2 className="section-title">Software</h2>
        {softwareResources.map((item, index) => (
          <div key={index} className="resource-item">
            <h3 className="resource-title">{item.title}</h3>
            <p className="resource-description">{item.description}</p>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="resource-link">Learn More</a>
          </div>
        ))}
      </div>
      <div className="external-learning-section">
        <h2 className="section-title">External Learning</h2>
        {externalLearningResources.map((item, index) => (
          <div key={index} className="resource-item">
            <h3 className="resource-title">{item.title}</h3>
            <p className="resource-description">{item.description}</p>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="resource-link">Learn More</a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
