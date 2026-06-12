import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { handleLogin, getFirebaseErrorMessage } from "../auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi");
      return;
    }

    setLoading(true);

    try {
      await handleLogin(email, password);
      navigate("/index");
    } catch (err) {
      setError(getFirebaseErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-[40px] shadow-xl w-full max-w-sm p-8 flex flex-col items-center">
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

        {error && (
          <div className="w-full bg-red-50 text-red-600 text-sm px-4 py-2 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full border border-gray-200 rounded-full py-4 pl-12 pr-4 focus:ring-2 focus:ring-yellow-400 outline-none"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-gray-600">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-full font-bold flex items-center justify-center gap-2 transition ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#f4c430] hover:bg-[#e5b82d] active:scale-95"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing in...
              </>
            ) : (
              <>
                Start Learning
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* <p className="text-center text-gray-400 text-sm mt-4">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="text-gray-800 font-bold hover:underline">
            Sign up
          </Link>
        </p> */}
      </div>
    </div>
  );
};

export default LoginPage;