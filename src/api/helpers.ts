import axios from "axios";

export const handleApiError = (
  error: unknown,
  showToast: (type: string, message: string) => void
) => {
  if (axios.isAxiosError(error)) {
    const errorMessage =
      error.response?.data?.message || "Something went wrong";
    console.error("API Error:", errorMessage);
    showToast("error", errorMessage);
  } else {
    console.error("Unexpected Error:", error);
    showToast("error", "An unexpected error occurred");
  }
};
