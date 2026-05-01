"use client";

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="mb-8 flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={`step-${index}`} className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                isActive
                  ? "bg-mint text-white shadow-lg scale-110"
                  : isCompleted
                  ? "bg-peach text-white"
                  : "bg-cream-dark text-brown-light"
              }`}
            >
              {isCompleted ? "✓" : stepNum}
            </div>
            <span
              className={`hidden text-sm font-medium sm:inline ${
                isActive ? "text-brown" : "text-brown-light"
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`mx-2 h-0.5 w-8 rounded ${
                  isCompleted ? "bg-peach" : "bg-cream-dark"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
