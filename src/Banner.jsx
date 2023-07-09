import React from 'react';
import bannerImage from './auburn.png'; // Replace with actual path

const Banner = () => {
    return (
        <div>
            <img src={bannerImage} alt="Banner" style={{ width: '100%' }} />
        </div>
    );
};

export default Banner;
