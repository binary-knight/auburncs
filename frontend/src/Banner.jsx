import React from 'react';
import bannerImage from './auburn-logo.png'; // Replace with actual path

const Banner = () => {
    const handleClick = () => {
        window.location.href = `https://${process.env.REACT_APP_ROUTE}.auburnonlinecs.com`;

    };

    return (
        <div>
            <a href={`https://${process.env.REACT_APP_ROUTE}.auburnonlinecs.com`} target="_blank" rel="noopener noreferrer" onClick={handleClick}>
                <img src={bannerImage} alt="Banner" style={{ width: '100%' }} />
            </a>
        </div>
    );
};

export default Banner;
