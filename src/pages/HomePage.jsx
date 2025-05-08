import React from 'react';

function HomePage() {
  return (
    <div>
      <h2>Welcome</h2>
      <p>Select an option from the navigation menu.</p>

      <p>Still need to implement CloudFront for the backend API. For now check on the backend URL and accept the risk of being sign signed CERT.</p>
      <p>
        <a href="https://ec2-44-211-91-81.compute-1.amazonaws.com/" target="_blank" rel="noopener noreferrer">
          https://ec2-44-211-91-81.compute-1.amazonaws.com/
        </a>
      </p>
      
      <p>Still need to implement CloudFront for the frontend API.</p>
    </div>
  );
}

export default HomePage; 