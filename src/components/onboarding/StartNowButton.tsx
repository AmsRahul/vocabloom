// src/components/onboarding/StartNowButton.tsx
import { useNavigate } from "react-router-dom";

export default function StartNowButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/index")}
      className="w-full bg-white text-orange-500 font-semibold mt-4 py-4 rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
    >
      Start Now
    </button>
  );
}
