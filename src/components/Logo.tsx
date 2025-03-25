
import React from 'react';

const Logo = () => {
  return (
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 bg-primary rounded-lg animate-spin-slow opacity-20" />
      <div className="absolute inset-1 bg-background rounded-md" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-primary rounded-sm transform rotate-45" />
      </div>
    </div>
  );
};

export default Logo;
