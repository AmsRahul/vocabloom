import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log("Login success:", userCredential.user);

      // 👉 nanti bisa redirect
      navigate("/dashboard");
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("Akun tidak ditemukan");
          break;
        case "auth/wrong-password":
          setError("Password salah");
          break;
        case "auth/invalid-email":
          setError("Format email tidak valid");
          break;
        default:
          setError("Gagal login, coba lagi");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-xl w-full max-w-sm p-8 flex flex-col items-center">
        {/* Logo */}
        <div className="bg-gray-50 rounded-3xl p-4 mb-6 w-full flex justify-center">
          <img
            src="/assets/images/owl.jpg"
            alt="Owl Mascot"
            className="w-32 h-32 object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-1">Welcome Back!</h1>
        <p className="text-gray-400 text-sm mb-6 text-center">
          Ready to learn some new words today?
        </p>

        {/* Error Message */}
        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <div className="w-full space-y-4">
          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-full py-4 pl-12 pr-4 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-full py-4 pl-12 pr-12 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Forgot */}
          <div className="flex justify-end">
            <button className="text-xs text-gray-400 hover:text-gray-600">
              Forgot Password?
            </button>
          </div>

          {/* Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition
              ${
                loading
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#f4c430] hover:bg-[#e5b82d] active:scale-95"
              }`}
          >
            {loading ? "Signing in..." : "Start Learning"}
            {!loading && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
