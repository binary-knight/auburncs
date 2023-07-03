import React from 'react';
import Banner from './Banner'; // Path to Banner.js
import Header from './Header'; // Path to Header.js
import ClassList from './ClassList'; // Path to ClassList.js

function App() {
    return (
        <div className="App">
            <Banner />
            <Header />
            <ClassList />
        </div>
    );
}

export default App;

