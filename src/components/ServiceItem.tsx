
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceItemProps {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  id,
  name,
  duration,
  price,
  description,
  selected,
  onSelect,
}) => {
  return (
    <div
      className={cn(
        "relative p-5 rounded-xl border transition-all duration-300 cursor-pointer animate-fade-in",
        selected 
          ? "border-primary ring-1 ring-primary/20 shadow-md" 
          : "border-border hover:border-primary/30 hover:bg-primary/5"
      )}
      onClick={() => onSelect(id)}
    >
      {selected && (
        <div className="absolute top-3 right-3 rounded-full bg-primary text-white p-1">
          <Check className="h-3 w-3" />
        </div>
      )}
      
      <div className="flex flex-col space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-block px-2 py-1 mb-2 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
              {duration}
            </span>
            <h3 className="text-lg font-medium">{name}</h3>
          </div>
          <span className="text-lg font-semibold">{price}</span>
        </div>
        
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

export default ServiceItem;
