import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from '@heroicons/react/20/solid';  // For Heroicons v2



export const GoBackButton: React.FC = () => {
	const navigate = useNavigate(); // Initialize the navigation hook
  
	const handleGoBack = () => {
	  navigate(-1); // Navigate back to the previous page
	};
  
	return (
<button 
      onClick={handleGoBack}
      className= " text-primary"
    >
      <ChevronLeftIcon className="h-15 w-15" /> {/* Add the arrow icon */}
    </button>
	);
  };