import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaPhone } from "react-icons/fa";

const BASE_URL = "https://server-l7kzrtsyb-keerthivasan2211s-projects.vercel.app/api";

const User = () => {
  const [phone, setPhone] = useState("");
  const [userData, setUserData] = useState({ user: null, response: "", status: "", loading: false });

  const handleLogin = async () => {
    if (!/^\d{10}$/.test(phone)) {
      toast.warn("📢 Phone number must be exactly 10 digits!");
      return;
    }

    setUserData((prev) => ({ ...prev, loading: true }));

    try {
      const { data } = await axios.post(`${BASE_URL}/login`, { phone });

      const responseData = await axios.get(`${BASE_URL}/users/response/${data.user._id}`);

      setUserData({
        user: data.user,
        response: responseData.data.response || "",
        status: "success",
        loading: false,
      });

      toast.success("✅ Login successful!");
    } catch (error) {
      setUserData({ user: null, response: "", status: "failed", loading: false });
      toast.error("❌ User not found!");
    }
  };

  const handleResponseSubmit = async (selectedResponse) => {
    try {
      await axios.post(`${BASE_URL}/users/response`, {
        userId: userData.user._id,
        response: selectedResponse,
      });

      setUserData((prev) => ({ ...prev, response: selectedResponse }));
      toast.success("✅ Response submitted!");
    } catch (error) {
      toast.error(error.response?.data || "⚠️ Error submitting response");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1>Product is under Testing. Please wait at least 1 min to submit a response.</h1>

      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">🔑 Food Attendance</h2>

        <div className="flex items-center bg-gray-100 rounded-lg p-3 mb-4">
          <FaPhone className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Enter phone number"
            className="bg-transparent outline-none w-full"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={userData.loading}
          className={`w-full py-2 rounded-lg text-white transition ${
            userData.loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {userData.loading ? "Logging in..." : "Login"}
        </button>

        {userData.status === "success" && <p className="mt-3 text-green-600 text-center font-semibold">✅ Login Successful!</p>}
        {userData.status === "failed" && <p className="mt-3 text-red-600 text-center font-semibold">❌ User Not Found!</p>}

        {userData.user && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaUser className="text-green-600" /> {userData.user.name}
            </h3>
            <p className="text-gray-600">📞 {userData.user.phone}</p>

            <h4 className="mt-4 font-medium text-gray-800">Submit Your Response:</h4>

            {!userData.response ? (
              <div className="flex gap-4 my-4">
                <button
                  className="flex-1 py-2 rounded-lg font-semibold bg-green-500 text-white transition hover:bg-green-600"
                  onClick={() => handleResponseSubmit("I Am In")}
                >
                  ✅ I Am In
                </button>
                <button
                  className="flex-1 py-2 rounded-lg font-semibold bg-red-500 text-white transition hover:bg-red-600"
                  onClick={() => handleResponseSubmit("Not Available")}
                >
                  ❌ Not Available
                </button>
              </div>
            ) : (
              <p className={`text-center text-lg font-semibold py-3 rounded-lg ${userData.response === "I Am In" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {userData.response === "I Am In" ? "✅ You are IN" : "❌ You are NOT Available"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
