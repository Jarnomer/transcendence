import React from 'react';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface SearchBarProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; // optional placeholder text
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
}) => {
  return (
    <div className="w-full flex justify-between ">
      <label htmlFor="searchBar" className="sr-only">
        Search
      </label>
      <input
        type="text"
        id="searchBar"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="p-2 border-1 w-full text-sm"
      />

      <div className="px-2 border">
        <MagnifyingGlassIcon className="size-6 h-full"></MagnifyingGlassIcon>
      </div>
    </div>
  );
};

export default SearchBar;
