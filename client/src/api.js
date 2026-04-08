import axios from 'axios';

const apiBaseUrl = (process.env.REACT_APP_API_BASE_URL || '').trim();

if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl;
}

export default axios;
