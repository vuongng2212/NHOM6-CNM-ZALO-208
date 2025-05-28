// Test trực tiếp không cần import file ngoài

// auth token we will use to generate a meeting and connect to it
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiIwNWYyODUzYi1jNTIzLTQ4ZDQtOWFjOS1hNmYzMGY1NjVkYzkiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc0ODI4MTkxMiwiZXhwIjoxNzQ4ODg2NzEyfQ.XoE5HzQGszTLfangc0IPneHIypOPdsnL5OrZ966fSqg";

// API call to create meeting
const createMeeting = async () => {
  try {
    const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
      method: "POST",
      headers: {
        authorization: `${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      throw new Error("Failed to create meeting");
    }
    const { roomId } = await res.json();
    return roomId;
  } catch (error) {
    console.error("Error creating meeting:", error);
    throw error;
  }
};

// Hàm test
const testCreateMeeting = async () => {
  try {
    const roomId = await createMeeting();
    console.log(" Tạo phòng thành công. roomId:", roomId);
  } catch (err) {
    console.error(" Lỗi khi tạo phòng:", err.message);
  }
};

testCreateMeeting();
