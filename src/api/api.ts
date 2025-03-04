import axios from "axios";

const api = {
  verifyPayment: async (data: "") => {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/file-upload`,
      data
    );
    return response.data;
  }
};

export default api;
