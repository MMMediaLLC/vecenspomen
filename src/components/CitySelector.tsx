import React from 'react';
import { CITIES } from '../constants';

interface CitySelectorProps {
  selectedCity: string | null;
  onSelect: (city: string | null) => void;
}

export const CitySelector: React.FC<CitySelectorProps> = ({ selectedCity, onSelect }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-12">
      <button
        onClick={() => onSelect(null)}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
          selectedCity === null 
            ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
            : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
        }`}
      >
        Сите градови
      </button>
      {CITIES.map((city) => (
        <button
          key={city.slug}
          onClick={() => onSelect(city.name)}
          className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
            selectedCity === city.name 
              ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
          }`}
        >
          {city.name}
        </button>
      ))}
    </div>
  );
};
