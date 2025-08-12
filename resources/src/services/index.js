import axios from "axios";

export const joinRoom = async ({ username, room }) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/gupshup/add-room`,
      { username, room }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to join room" };
  }
};

export const getRoom = async ({ id, username, room }) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/gupshup/get-room`,
      { params: { id, username, room } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to get room" };
  }
};

export const addChat = async (formData) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_API_URL}/gupshup/add-chat`,
      formData, // ✅ use FormData
      {
        headers: { "Content-Type": "multipart/form-data" }, // ✅ tell server
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error Saving Chat: ", error);
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const getChat = async ({ room }) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/gupshup/get-chat/${room}`
    );
    return response.data;
  } catch (error) {
    console.error("Error in Fetching  Chat: ", error);
    throw error.response?.data || { message: "Something went wrong" };
  }
};
