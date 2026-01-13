// src/pages/OnboardingPage.tsx
import OnboardingHero from "@/components/onboarding/OnboardingHero";
import StartNowButton from "@/components/onboarding/StartNowButton";

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-orange-500 flex justify-center items-center">
      <div className="w-full max-w-sm px-6 py-10 flex flex-col justify-between h-full">
        <OnboardingHero />
        <StartNowButton />
      </div>
    </div>
  );
}
