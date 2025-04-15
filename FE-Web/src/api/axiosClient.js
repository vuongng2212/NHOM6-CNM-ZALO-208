import axios from 'axios';
import queryString from 'query-string';
import Cookies from 'js-cookie'; // import js-cookie

console.log(process.env.REACT_APP_API_URL);
const axiosClient = axios.create({
	baseURL:
		process.env.REACT_APP_API_URL + '/api' || 'http://localhost:8000/api',
	headers: {
		'content-type': 'application/json',
	},
	paramsSerializer: (params) => queryString.stringify(params),
});


axiosClient.interceptors.request.use(async (config) => {
	const authToken = Cookies.get('authToken');
  if (authToken) {
    config.headers.Authorization = `${authToken}`;
  }

  if (config.method === 'get') {
    console.log('GET request full URL:', config.baseURL + config.url);
  }
	return config;
});

axiosClient.interceptors.response.use(
	(res) => {
		if (res && res.data) {
			return { data: res.data, status: res.status };
		}
		return res;
	},
	(error) => {
		throw error;
	}
);

export default axiosClient;