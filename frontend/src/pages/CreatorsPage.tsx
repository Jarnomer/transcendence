import React from "react";

// Defining types for CreatorCard
interface CreatorCardProps {
  imagePath: string;
  name: string;
  role: string;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ imagePath, name, role }) => {
  return (
    <div className="svg-wrapper relative aspect-448-577">
      <svg
        id="creator"
        className="w-full text-blue m-0 z-10 text-primary"
        viewBox="0 0 448 577"
        fill="black"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="image-mask">
            <path d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z" />
          </clipPath>
        </defs>

        <path
          d="M43.0948 1L1 48.7056V552H383.01L423 506.68V1H43.0948Z"
          stroke="currentColor"
          strokeWidth="3"
          className="fill-primary"
          fillOpacity="0.2"
        />
        <path
          className="creator-img-container stroke-2 fill-primary"
          d="M62.3067 17L25 49.381V391H363.559L399 360.238V17H62.3067Z"
          stroke="currentColor"
        />
        <image
          href={imagePath}
          x="26"
          y="17"
          width="400"
          height="400"
          clipPath="url(#image-mask)"
        />
      </svg>

      <div className="absolute bottom-8 w-full text-center">
        <h2>{name}</h2>
        <p>{role}</p>
      </div>
    </div>
  );
};



export const CreatorsPage: React.FC = () =>{
  const creators = [
    { imagePath: "./src/assets/svg/olli_halftone.svg", name: "Olli", role: "Front-End" },
    { imagePath: "./src/assets/svg/janrau_halftone.svg", name: "Janrau", role: "Back-End / User Management" },
    { imagePath: "./src/assets/svg/lassi_halftone.svg", name: "Lassi", role: "Back-End / AI Opponent" },
    { imagePath: "./src/assets/svg/jarno_halftone.svg", name: "Jarno", role: "3D / Microservices" },
  ];

  return (
    <div id="creators-page">
      <h1 className="w-full text-center font-heading text-3xl">Site created by:</h1>

      <div
        id="creators-container"
        className="relative grid grid-cols-1 gap-4 pt-2 px-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-primary text-primary h-full w-80% pt-1"
      >
        {creators.map((creator, index) => (
          <CreatorCard key={index} {...creator} />
        ))}
      </div>
    </div>
  );
};


