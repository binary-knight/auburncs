import React from 'react';
import bannerImage from './auburn.png'; // Replace with actual path

const Banner = () => {
    const handleClick = () => {
        window.location.href = 'https://dev.auburnonlinecs.com';
    };

    return (
        <div>
            <a href="https://dev.auburnonlinecs.com" target="_blank" rel="noopener noreferrer" onClick={handleClick}>
                <img src={bannerImage} alt="Banner" style={{ width: '100%' }} />
            </a>
        </div>
    );
};

export default Banner;
