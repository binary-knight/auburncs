import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Donate = () => {
  const [forecast, setForecast] = useState(null);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_ROUTE}/donate`)
      .then(response => {
        // Get the current date
        const now = new Date();

        // Get the last day of this month
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Calculate the number of days left in the month
        const daysLeft = lastDayOfMonth.getDate() - now.getDate();

        // Calculate the forecasted cost for the rest of the month
        const restOfMonthForecast = (parseFloat(response.data.forecast[0].MeanValue) / lastDayOfMonth.getDate()) * daysLeft;

        // Get the current month
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const currentMonth = monthNames[now.getMonth()];

        setForecast({cost: restOfMonthForecast.toFixed(2), month: currentMonth});
        setCurrent({cost: response.data.current.toFixed(2), month: currentMonth});
      })
      .catch(error => console.error('Error:', error));
  }, []); // Empty dependency array so the effect runs once on component mount

  const donationScript = '<script src="https://donorbox.org/widget.js" paypalExpress="false"></script>';
  const donationIframe = '<iframe src="https://donorbox.org/embed/auburn-online-cs?default_interval=o&hide_donation_meter=true&show_content=true" name="donorbox" allowpaymentrequest="allowpaymentrequest" seamless="seamless" frameborder="0" scrolling="no" height="900px" width="100%" style="max-width: 100%; min-width: 100%; max-height:none!important"></iframe>';

  return (
    <div>
      <h1>Donate</h1>
      <p>
        Help us defray server costs. 
        {forecast && current ? 
          `Forecasted server costs for the month of ${forecast.month}: $${forecast.cost}` : 
          'Loading costs...'}
      </p>
      <div dangerouslySetInnerHTML={{__html: donationScript}} />
      <div dangerouslySetInnerHTML={{__html: donationIframe}} />
    </div>
  );
}

export default Donate;


