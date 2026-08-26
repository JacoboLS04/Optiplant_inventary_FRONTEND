import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange?: (index: number) => void;
}

export function Stepper({ steps, currentStep, onStepChange }: StepperProps) {
  return (
    <ol className="flex items-center gap-2" aria-label="Progreso">
      {steps.map((step, index) => {
        const completed = index < currentStep;
        const active = index === currentStep;
        const reachable = index <= currentStep;

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
            <button
              type="button"
              onClick={() => onStepChange?.(index)}
              disabled={!reachable || !onStepChange}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex min-w-0 items-center gap-2 rounded-md px-1 py-1 text-left transition-colors",
                reachable && onStepChange
                  ? "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  : "cursor-default"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
                  completed && "border-primary bg-primary text-primary-foreground",
                  active && "border-foreground bg-foreground text-background",
                  !completed && !active && "border-border text-muted-foreground"
                )}
              >
                {completed ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={cn(
                  "hidden truncate text-sm sm:inline",
                  active ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </button>

            {index < steps.length - 1 ? (
              <span
                className={cn(
                  "h-px flex-1",
                  completed ? "bg-primary" : "bg-border"
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
