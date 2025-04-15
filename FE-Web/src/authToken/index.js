import React, { createContext, useState } from 'react';
import Cookies from 'js-cookie';
import authApi from '../api/authApi';
import decodeJwtPayload from '../util/decodeJwt';

export let AuthToken = createContext();

const AuthProvider = ({ children }) => {
	const authTokenCookie = Cookies.get('authToken');

	const [user, setUser] = useState(authTokenCookie || null);
	const [role, setRole] = useState(
		authTokenCookie ? decodeJwtPayload(authTokenCookie).is_staff : null
	);

	const login = async (data) => {
		const res = await authApi.login(data);
		// console.log(res);
		if (res.data && res.data.token) {
			const authToken = res.data.token;
			const decode = decodeJwtPayload(authToken);
			// Đặt token vào cookie "authToken" và thời gian sống là 7 ngày
			Cookies.set('authToken', authToken, { expires: 7 });
			localStorage.setItem('userId', JSON.stringify(decode.id));

			setUser(authToken);
			setRole(decode?.is_staff);
		}
	};
	const logout = () => {
		setUser(null);
		setRole(null);
		Cookies.remove('role');
		Cookies.remove('authToken');
	};
	let authData = {
		user,
		role,
		login,
		logout,
	};
	return <AuthToken.Provider value={authData}>{children}</AuthToken.Provider>;
};

export default AuthProvider;