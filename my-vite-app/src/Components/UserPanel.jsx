import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaPhone, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const User = () => {
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState(null);
  const [response, setResponse] = useState("");
  const [loginStatus, setLoginStatus] = useState("");

  const handleLogin = async () => {
    if (!/^\d{10}$/.test(phone)) {
      alert("📢 Phone number must be exactly 10 digits!");
      return;
    }
  
    try {
      const { data } = await axios.post("https://foodapp-backend-o35r.onrender.com/api/login", { phone });
      setUser(data.user);
      setLoginStatus("success");
      toast.success("✅ Login successful!");
  
      // Fetch existing response for the user
      const responseData = await axios.get(`https://foodapp-backend-o35r.onrender.com/api/users/response/${data.user._id}`);
      if (responseData.data.response) {
        setResponse(responseData.data.response); // Set response if it exists
      }
    } catch (error) {
      setLoginStatus("failed");
      toast.error("❌ User not found!");
    }
  };
  
  const handleResponseSubmit = async (selectedResponse) => {
    try {
      await axios.post("https://foodapp-backend-o35r.onrender.com/api/users/response", {
        userId: user._id,
        response: selectedResponse,
      });

      setResponse(selectedResponse); // Update UI after submitting response
      toast.success("✅ Response submitted!");
    } catch (error) {
      toast.error(error.response?.data || "⚠️ Error submitting response");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      {/* User Login Section */}
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

        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Login
        </button>

        {/* Show login success or failure message */}
        {loginStatus === "success" && (
          <p className="mt-3 text-green-600 text-center font-semibold">✅ Login Successful!</p>
        )}
        {loginStatus === "failed" && (
          <p className="mt-3 text-red-600 text-center font-semibold">❌ User Not Found!</p>
        )}

        {user && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FaUser className="text-green-600" /> {user.name}
            </h3>
            <p className="text-gray-600">📞 {user.phone}</p>

            <h4 className="mt-4 font-medium text-gray-800">Submit Your Response:</h4>

            {/* Show buttons only if no response exists */}
            {!response ? (
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
              // Show existing response
              <p className={`text-center text-lg font-semibold py-3 rounded-lg ${response === "I Am In" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {response === "I Am In" ? "✅ You are IN" : "❌ You are NOT Available"}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
