import Cookies from 'js-cookie';
import axiosClient from './axiosClient';

const analysisApi = {
	ChartThoiGian: (reqData, calculationType) => {
		const url = `/chart/dien-nang-tieu-thu/thoi-gian?calculation_type=${calculationType}`;
		const token = Cookies.get('authToken');

		const config = {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		};

		return axiosClient.post(url, reqData, config);
	},

	ChartViTri: (reqData, calculationType) => {
		const url = `/chart/dien-nang-tieu-thu/vi-tri`;
		const token = Cookies.get('authToken');

		const config = {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			params: {
				calculation_type: calculationType,
			},
		};

		return axiosClient.post(url, reqData, config);
	},

	ChartKetHop: (reqData, calculationType) => {
		const url = `/chart/tieu-thu`;
		const token = Cookies.get('authToken');

		const config = {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			params: {
				calculation_type: calculationType,
			},
		};

		return axiosClient.post(url, reqData, config);
	},
};

export default analysisApi;
