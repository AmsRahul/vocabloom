// src/components/onboarding/OnboardingHero.tsx
export default function OnboardingHero() {
  return (
    <div className="text-center text-white space-y-6">
      {/* Illustration */}
      <img
        src="/assets/images/onboarding-illustration.png"
        alt="Learning Illustration"
        className="w-90 mx-auto"
      />

      {/* Title */}
      <h1 className="text-2xl font-bold leading-snug">
        Learn Any Thing
        <br />
        Any Time Any Where
      </h1>

      {/* Description */}
      <p className="text-sm text-white/90 leading-relaxed">
        Learning just a click away. Online learning is education that takes
        place over the internet.
      </p>
    </div>
  );
}
