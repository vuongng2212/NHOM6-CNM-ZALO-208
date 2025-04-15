import {useContext} from 'react';
import {
	createBrowserRouter,
	RouterProvider,
	Routes,
	Navigate,
} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Layout from './layout/Layout';
import Home from './pages/Home';
import route from './configs/route';
import { AuthToken } from './authToken';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import Register from './pages/Register';
import Chat from './pages/Chat';
import MeetingView from './pages/MeetingView';
import MeetingView2 from './pages/MeetingView2';
import RegisterOtpConfirm from './pages/RegisterOtpConfirm';
import ForgotPassword from './pages/ForgotPassword';
import SendOtp from './components/SendOtp'
import ListFriendRequest from './pages/ListFriendRequest';
import Friend from './pages/Friend';
import RecallFriendRequest from './pages/RecallFriendRequest';
const PrivateRoute = ({ children, requiredRole }) => {
	const { role } = useContext(AuthToken);
	if (
		(requiredRole === undefined && role !== null) ||
		requiredRole === role
	) {
		return children;
	} else {
		return <Navigate to={route.login} />;
	}
};
const router = createBrowserRouter([
	{
		path: route.home,
		element: (
			<Layout>
				<Home />
			</Layout>
		)
	},
	{
		path: route.registerConfirm,
		element: (
		  <Layout>
			<RegisterOtpConfirm />
		  </Layout>
		),
	},
	{
		path: route.forgotPassword,
		element: (
		  <Layout>
			<ForgotPassword />
		  </Layout>
		),
	  },

	{
		path: route.resetPasswordConfirm,
		element: (
			<Layout>
				<ResetPasswordConfirm />
			</Layout>
		)
	},
	{
		path: route.resetPassword,
		element: (
		  <Layout>
			<ResetPassword />
		  </Layout>
		),
	  },
	{
		path: route.register,
		element: (
			<Layout>
				<Register/>
			</Layout>
		)
	},
	{
		path: route.chat,
		element: (
			<Chat/>
		)
	},
	{
		path: route.messages,
		element: (
			<Chat />
		)
	},
	{
		path: route.meetingView,
		element: (
			<MeetingView />
		)
	},{
		path: route.meetingView2,
		element: (
			<MeetingView2 />
		)
	},
	{
		path: route.RecallFriendRequest,
		element: (
			<RecallFriendRequest />
		)
	},
	{
		path: route.friendRequest,
		element: (
			<ListFriendRequest />
		)
	  },
	  {
		path: route.forgotPassword,
		element: <ForgotPassword />,
	},
	{
		path: route.resetPassword,
		element: <ResetPassword />,
	},
	{
		path: route.sendOtp,
		element: (
			<Layout >
				<div className="d-flex justify-content-center w-100">
					<SendOtp />
				</div>
			</Layout>
		),
	},
	{
		path: route.friend,
		element: (
			<Friend />
		)
	}
]);
function App() {
	return (
		<>
			<RouterProvider router={router}>
				<Routes />
			</RouterProvider>
		</>
	);
}

export default App;
