import React from 'react';

interface checkBoxProps {
  isEnabled: boolean;
  setIsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  id: string;
}

export const CheckBox: React.FC<checkBoxProps> = ({ isEnabled, setIsEnabled, id }) => {
  return (
    <div className="flex items-center mb-4">
      <input
        type="checkbox"
        id={id}
        checked={isEnabled}
        onChange={() => setIsEnabled(!isEnabled)}
        className="min-w-5 min-h-5 w-5 h-5 border-2 border-current bg-transparent appearance-none cursor-pointer checked:bg-transparent checked:border-current checked:text-current checked:after:content-['✔'] checked:after:text-current checked:after:block checked:after:text-center"
      />
      <label htmlFor={id} className="ml-2 cursor-pointer text-xs">
        <span className={`text-xs ${isEnabled ? 'text-secondary' : 'text-gray-400'}`}>
          {isEnabled ? 'enabled' : 'disabled'}
        </span>
      </label>
    </div>
  );
};
