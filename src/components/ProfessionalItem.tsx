
import React from 'react';
import { Check, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfessionalItemProps {
  id: string;
  name: string;
  photoUrl?: string;
  bio?: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

const ProfessionalItem: React.FC<ProfessionalItemProps> = ({
  id,
  name,
  photoUrl,
  bio,
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
      
      <div className="flex items-center space-x-4">
        <div className="rounded-full h-12 w-12 bg-secondary flex items-center justify-center overflow-hidden">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-secondary-foreground" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-medium">{name}</h3>
          {bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{bio}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalItem;
