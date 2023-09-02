import React from 'react';
import './faq.css';

const FAQ = () => {
  const faqData = [
    {
      question: 'Are Auburn University Online Computer Science students eligible for co-ops with companies?',
      answer: 'Yes.  We have had two students in the program get accepted to co-op opportunities with Georgia Tech Research Institute.  It is possible.  A co-op is a 3-semester paid work experience in which students gain experience relevant to their field of study.  The two students that have been accepted to GTRI were the very first online students to do such, but it is most definitely possible.  Please reach out to the University Career Center at 334-844-5410 if you would like more information',
    },
    {
      question: 'Do the online classes differ from the  on campus classes?',
      answer: 'In short–no.  The same core instruction that the students on campus receive, we receive as well through pre-recorded lectures that you can watch at your own pace.  Instructor interaction is done through various mediums using Canvas.  With a couple of exceptions, the instructors are very responsive–especially in the harder classes like Data Structures and Algorithms.',
    },
    {
      question: 'Does the difference between a “Bachelor of Science in Computer Science” and a “Bachelor of Computer Science” really matter?',
      answer: 'To the extent that we have done research, and with some of us actually working in the software engineering industry already as hiring managers, the short answer is no.  Most companies won’t care as long as it was from a reputable school (which Auburn is!).  The online program is also not ABET accredited, but for Computer Science the ABET accreditation isn’t all that important.',
    },
    {
      question: 'Can I transfer credits from another institution?',
      answer: 'Yes, we accept transfer credits from accredited institutions. You need to submit your official transcripts for evaluation. Our academic advisors will review your transcripts and determine the transferability of credits.',
    },
    {
      question: 'Will this degree prepare me to ace technical interviews?',
      answer: 'This degree will provide you with a sound foundation.  However, you will get what you put in.  Any CS degree is only going to arm you with enough information to be dangerous.  If you really want to ace technical interviews, you are going to need to put in a lot of hours actually applying the stuff you learn in class and honing your skills.  We suggest checking out Hacker Rank, LeetCode, and picking up a copy of Cracking the Coding Interview.',
    },
    {
      question: 'I got accepted by Auburn, should I wait for <insert school name> to issue a decision?',
      answer: 'This is a question we get asked a lot by prospective students.  There is no answer to this query.  There are several factors involved in this decision, all of which are personal to your situation.  Do you live on the West Coast?  Perhaps the answer is yes, then.  You will likely meet people who have heard more of schools on the West Coast than in the South–this will also play into employer school recognition.  Auburn is a relatively well-known school, mainly because of their “War Eagle” mascot and football team…however, geographical location should play heavily in your situation.  Auburn does offer substantial job placement resources, however–you can assume that most of those jobs will be located in the South (however, that’s not always the case).  At the end of the day, any CS program gives you tools to build a strong foundation in computer science related topics.  The only real thing that matters is your ability to pass technical interviews when you apply for jobs.  If you lack the fortitude to put in the effort, it won’t matter what school you go to.',
    },
  ];

  return (
    <div className="faq">
      <h1 className="faq-title">Frequently Asked Questions</h1>
      {faqData.map((item, index) => (
        <div key={index} className="faq-item">
          <h3 className="faq-question">{item.question}</h3>
          <p className="faq-answer">{item.answer}</p>
        </div>
      ))}
    </div>
  );
};


export default FAQ;
