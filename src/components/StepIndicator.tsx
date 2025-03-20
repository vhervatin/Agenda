
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep === index;
          const isCompleted = currentStep > index;
          
          return (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isActive && "border-primary bg-primary text-white",
                    isCompleted && "border-primary bg-primary text-white",
                    !isActive && !isCompleted && "border-muted-foreground text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span 
                  className={cn(
                    "text-xs mt-2 text-center",
                    (isActive || isCompleted) ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {step}
                </span>
              </div>
              
              {/* Connector Line (except after the last step) */}
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "flex-1 h-[2px] mx-2",
                    index < currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
