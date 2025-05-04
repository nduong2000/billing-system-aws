// Add this script to your browser console to debug the claim form

// Create a wrapper for fetch or axios
(function() {
  // Store the original fetch function
  const originalFetch = window.fetch;
  
  // Override fetch to log requests
  window.fetch = function(...args) {
    const [url, options] = args;
    
    if (url.includes('/api/claims') && options && options.method === 'POST') {
      console.log('🔍 CLAIM REQUEST URL:', url);
      console.log('🔍 CLAIM REQUEST OPTIONS:', JSON.stringify(options, null, 2));
      console.log('🔍 CLAIM REQUEST BODY:', JSON.stringify(JSON.parse(options.body), null, 2));
      
      // You can modify the request here for testing if needed
      // For example, to fix a field or add a missing one
      // const modifiedBody = JSON.parse(options.body);
      // modifiedBody.claim_date = new Date().toISOString().split('T')[0];
      // options.body = JSON.stringify(modifiedBody);
    }
    
    return originalFetch.apply(this, args);
  };
  
  // If you're using axios, also monitor it
  if (window.axios) {
    const originalAxiosPost = window.axios.post;
    
    window.axios.post = function(url, data, config) {
      if (url.includes('/api/claims')) {
        console.log('🔍 AXIOS CLAIM REQUEST URL:', url);
        console.log('🔍 AXIOS CLAIM REQUEST DATA:', JSON.stringify(data, null, 2));
        console.log('🔍 AXIOS CLAIM REQUEST CONFIG:', JSON.stringify(config, null, 2));
        
        // You can modify the data here for testing if needed
      }
      
      return originalAxiosPost.apply(this, arguments);
    };
  }
  
  console.log('✅ Claim form debugging enabled! Submit the form to see the request data.');
})();

// How to use:
// 1. Open your browser developer tools (F12)
// 2. Go to the Console tab
// 3. Copy and paste this entire script and press Enter
// 4. Fill out the claim form and submit it
// 5. Look at the console to see what data is being sent 