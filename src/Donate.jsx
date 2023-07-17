import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Donate.css';
import Spinner from './Spinner';  // Assuming you have a Spinner component

const Donate = () => {
  const [forecast, setForecast] = useState(null);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_ROUTE}/donate`)
      .then(response => {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date();
        const currentMonth = monthNames[now.getMonth()];
        setForecast({cost: parseFloat(response.data.forecast[0].MeanValue).toFixed(2), month: currentMonth});
        setCurrent({cost: response.data.current.toFixed(2), month: currentMonth});
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  const donationScript = '<script src="https://donorbox.org/widget.js" paypalExpress="false"></script>';
  const donationIframe = '<iframe src="https://donorbox.org/embed/auburn-online-cs" name="donorbox" allowpaymentrequest="allowpaymentrequest" seamless="seamless" frameborder="0" scrolling="no" height="900px" width="100%" style="max-width: 500px; min-width: 250px; max-height:none!important"></iframe>';

    return (
      <div className="donate-container">
        <h1 className="donate-header">Donate</h1>
        <p className="donate-info">
          Help us defray server costs. 
          {loading ? 
            <div className="donate-loading"><Spinner /></div> : 
            <> Forecasted server costs for the month of {forecast.month}: <span style={{color: 'red', fontWeight: 'bold'}}>${forecast.cost}</span></>
          }
        </p>
        <div dangerouslySetInnerHTML={{__html: donationScript}} />
        <div dangerouslySetInnerHTML={{__html: donationIframe}} />
      </div>
    );
  }
  
  export default Donate;
  