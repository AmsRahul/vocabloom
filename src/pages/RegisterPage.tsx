import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Eye, EyeOff, Lock, ArrowRight, Loader2 } from "lucide-react";
import { handleRegister, getFirebaseErrorMessage } from "../auth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !email || !password || !confirmPassword) {
      setError("Semua field wajib diisi");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      await handleRegister(email, password, username);
      navigate("/index");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-xl w-full max-w-sm p-8 flex flex-col">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-gray-800 mb-1">
            Join the Adventure!
          </h1>
          <p className="text-gray-400 text-sm">
            Create your account to unlock new words.
          </p>
        </div>

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Username</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Your Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="name"
                className="w-full bg-white border border-gray-200 rounded-full py-3.5 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <User className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                placeholder="parent@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-white border border-gray-200 rounded-full py-3.5 px-6 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........"
                autoComplete="new-password"
                className="w-full bg-white border border-gray-200 rounded-full py-3.5 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700 ml-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="........"
                autoComplete="new-password"
                className="w-full bg-white border border-gray-200 rounded-full py-3.5 px-6 pr-12 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 mt-4 shadow-lg shadow-yellow-100 transition-transform active:scale-95 ${
              loading ? "bg-gray-300 cursor-not-allowed" : "bg-[#f4c430] hover:bg-[#e5b82d]"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating account...
              </>
            ) : (
              <>
                Sign Up
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-gray-800 font-bold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;