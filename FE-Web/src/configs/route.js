import RecallFriendRequest from "../pages/RecallFriendRequest";

const route = {
	home: '/',
	register:'/register',
	registerConfirm: "/register-confirm/",
  	forgotPassword: "/forgot-password",
	resetPasswordConfirm:'/reset-password-confirm',
	resetPassword: "/reset-password/:id/:token",
	sendOtp:"/send-otp",
	chat:'/chat',
	messages:'/messages/:id',
	meetingView:'/meeting/:meetingId',
	meetingView2:'/meeting2/:meetingId',
	callList: "/call-list",
	friendRequest: "/friend-request",
	friend: "/friend",
	RecallFriendRequest: "/recall-friend-request",
};

export default route;
