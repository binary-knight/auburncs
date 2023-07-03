import React from 'react';

const Header = () => {
    return (
        <div style={{ backgroundColor: 'black', padding: '10px' }}>
            <ul style={{ listStyleType: 'none', display: 'flex', justifyContent: 'space-around', margin: '0', padding: '0' }}>
                <li><a href="https://www.reddit.com/r/AuburnOnlineCS/" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>Reddit</a></li>
                <li><a href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>Resource 2</a></li>
                <li><a href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>Resource 3</a></li>
                <li><a href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>Resource 4</a></li>
                <li><a href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none' }}>Resource 5</a></li>
            </ul>
        </div>
    );
};

export default Header;

