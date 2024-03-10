// Encapsulate Axios
import axios from 'axios'

const axios_instance = axios.create({
    // Configure root domain
    baseURL: 'http://127.0.0.1:8000',  
    // Set Timeout
    // timeout: 5000,
    headers: {
      'Content-Type': 'application/json'
    }
})


// Add a request interceptor
axios_instance.interceptors.request.use( (config) => {
    // put token in the request Header
    return config;
  }, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
axios_instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  }, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  });


  export { axios_instance }