// src/pages/OnboardingPage.tsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // Opsional: untuk animasi masuk

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-orange-500 flex justify-center items-center font-sans antialiased">
      <div className="w-full max-w-sm px-8 py-12 flex flex-col justify-between h-[90vh] bg-orange-500">
        {/* Top Content Area */}
        <div className="flex-1 flex flex-col justify-center text-center text-white">
          {/* Illustration Container with Border */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative mb-10"
          >
            {/* Dekorasi lingkaran di belakang gambar (opsional untuk kedalaman) */}
            <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl transform scale-75" />

            <div className="relative z-10 p-4 bg-white/10 rounded-[40px] border-2 border-white/20 backdrop-blur-sm shadow-2xl">
              <img
                src="/assets/images/onboarding-illustration.png"
                alt="Learning Illustration"
                className="w-full h-auto rounded-[30px] border-4 border-white shadow-inner object-cover"
              />
            </div>
          </motion.div>

          {/* Text Content */}
          <div className="space-y-4">
            <h1 className="text-3xl font-black leading-tight tracking-tight">
              Learn Anything
              <br />
              <span className="text-orange-200">Anytime Anywhere</span>
            </h1>

            <p className="text-sm text-orange-50 font-medium leading-relaxed opacity-90 px-2">
              Learning just a click away. Online learning is education that
              takes place over the internet.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/index")}
            className="w-full bg-white text-orange-600 font-black text-lg py-5 rounded-3xl shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:bg-orange-50 hover:shadow-xl active:scale-95 transition-all duration-200"
          >
            Get Started
          </button>

          {/* Indikator halaman kecil (opsional) */}
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-6 h-1.5 bg-white rounded-full" />
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
            <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
