import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [adminId] = useState(0); // Static Admin ID

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("https://foodapp-backend-o35r.onrender.com/api/admin");
      setUsers(response.data.users);
    } catch (error) {
      toast.error("Error fetching users!");
    }
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      alert("⚠️ Phone number must be exactly 10 digits and contain only numbers!");
      return false;
    }
    return true;
  };

  const addUser = async () => {
    if (!name || !phone) {
      toast.warning("Please enter name and phone number!");
      return;
    }
    if (!validatePhoneNumber(phone)) {
      return;
    }
  
    try {
      const response = await axios.post("https://foodapp-backend-o35r.onrender.com/api/admin/add-user", {
        adminId,
        name,
        phone,
      });
  
      setName("");
      setPhone("");
      toast.success("User added successfully!");
      fetchUsers();
    } catch (error) {
      if (error.response && error.response.status === 400) {
        const { message, existingUser } = error.response.data;
        
        if (message === "Phone number already exists." && existingUser) {
          const confirmReset = window.confirm(
            `${existingUser.name} (${existingUser.phone}) already exists. Do you want to reset their response?`
          );
          if (confirmReset) {
            resetResponse(existingUser._id);
          }
        } else {
          toast.error(message);
        }
      } else {
        toast.error("Error adding user!");
      }
    }
  };
  

  const resetResponse = async (userId) => {
    try {
      await axios.post("https://foodapp-backend-o35r.onrender.com/api/admin/reset-response", { adminId, userId });
      toast.info("User response reset!");
      fetchUsers();
    } catch (error) {
      toast.error("Error resetting response!");
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(`https://foodapp-backend-o35r.onrender.com/api/admin/delete-user/${userId}`, {
        data: { adminId },
      });
      toast.success("User deleted successfully!");
      fetchUsers();
    } catch (error) {
      toast.error("Error deleting user!");
    }
  };

  const imInCount = users.filter((user) => user.response === "I Am In").length;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
      <div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          Admin Panel
        </h2>

        <div className="text-center mt-4">
          <p className="text-xl font-semibold text-green-700">
            ✅ I Am In Count: {imInCount}
          </p>
        </div>

        {/* Add User Section */}
        <div className="bg-gray-100 p-5 rounded-lg shadow-md mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Add New User
          </h3>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Enter Name"
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Phone"
              className="input input-bordered w-full"
              value={phone}
              onChange={(e) => {
                const value = e.target.value;
                if (/[^0-9]/.test(value)) {
                  alert("⚠️ Phone number can only contain numbers!");
                }
                setPhone(value.replace(/[^0-9]/g, "").slice(0, 10)); // Restrict to 10 digits
              }}
            />
            <button
              onClick={addUser}
              className="btn btn-primary w-full hover:shadow-md transition duration-200"
            >
              ➕ Add User
            </button>
          </div>
        </div>

        {/* User List */}
        <h3 className="text-2xl font-semibold text-gray-800 mt-8 text-center">
          User List
        </h3>
        {users.length === 0 ? (
          <p className="text-center text-gray-500 mt-3">No users found.</p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="p-5 bg-white rounded-lg shadow-md flex justify-between items-center border border-gray-200"
              >
                <div>
                  <p className="text-lg font-medium text-gray-800">
                    {user.name} ({user.phone})
                  </p>
                  <p
                    className={`text-sm font-semibold mt-1 ${
                      user.response === "I Am In"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {user.response === "I Am In" ? "✅ I'm In!" : "❌ I'm Not!"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => resetResponse(user._id)}
                    className="btn btn-warning btn-sm hover:shadow-md"
                  >
                    🔄 Reset
                  </button>
                  <button
                    onClick={() => deleteUser(user._id)}
                    className="btn btn-error btn-sm hover:shadow-md"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
