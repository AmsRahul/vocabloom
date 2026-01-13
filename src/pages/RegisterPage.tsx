import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  Mail,
  Eye,
  EyeOff,
  Lock,
  ArrowRight,
} from "lucide-react";

import { handleRegister } from "../auth";


const RegisterPage = () => {

    const onSubmit = async () => {
      setError("");

      if (!username || !email || !password) {
        setError("All fields are required");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      try {
        setLoading(true);
        await handleRegister(email, password, username);
        // redirect / success
        console.log("Register success");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Container Utama */}
      <div className="bg-white rounded-[40px] shadow-xl w-full max-w-sm p-8 flex flex-col relative">
        {/* Header Text */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
            Join the Adventure!
          </h1>
          <p className="text-gray-400 text-sm">
            Create your account to unlock new words.
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Your Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-3.5 px-6 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <User className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full py-3.5 px-6 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........"
                className="w-full bg-white border border-gray-200 rounded-full py-3.5 px-6 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="........"
                className="w-full bg-white border border-gray-200 rounded-full py-3.5 px-6 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {/* Sign Up Button */}
          <button
            onClick={onSubmit}
            disabled={loading}
            className="w-full bg-[#f4c430] hover:bg-[#e5b82d] text-gray-800 font-bold py-4 rounded-full flex items-center justify-center gap-2 mt-4 shadow-lg shadow-yellow-100 transition-transform active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </div>

        {/* Divider */}

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <button className="text-gray-800 font-bold hover:underline">
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
