import React from 'react';

export interface checkBoxProps {
  isEnabled: boolean;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
  label?: string; // Optional label with a default value
}

export const CheckBox: React.FC<checkBoxProps> = ({
  isEnabled,
  setIsEnabled,
  id,
  label = 'Enable', // Default value if not provided
}) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={isEnabled}
        onChange={() => setIsEnabled(!isEnabled)}
        className="w-5 h-5 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
      />
      <label htmlFor={id} className="ml-2 cursor-pointer text-xs">
        {label}
      </label>
    </div>
  );
};
