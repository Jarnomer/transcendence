

export const SVGModal: React.FC<{ children: React.ReactNode }> = ({ children }) => {

	return (
		<>

	<div className="p-0 m-0 relative inline-block  text-primary">
      <div className="w-full h-full flex flex-col p-0 m-0 items-center text-center gap-5">
        <div className="relative w-full text-blue p-0 m-0  text-primary">
	  <div className="svg-card-wrapper w-full relative text-primary text-center">
		<svg
		  className="w-full h-auto" height="549"
		  viewBox="0 0 549 814"
		  fill="none"
		  xmlns="http://www.w3.org/2000/svg"
		  preserveAspectRatio="xMidYMid meet"
		>
		  <g filter="url(#filter0_d_1_197)">
			<path
			  d="M54.3666 9L1 77.2251V797H485.302L536 732.186V9H54.3666Z"
			  className="fill-primary"
			  fillOpacity="0.15"
			  shapeRendering="crispEdges"
			/>
			<path
			  d="M54.3666 9L1 77.2251V797H485.302L536 732.186V9H54.3666Z"
			  stroke="currentColor"
			  strokeWidth="2"
			  shapeRendering="crispEdges"
			/>
		  </g>
		  <path
			d="M17 773H16V774H17V773ZM137.283 772H17V774H137.283V772ZM18 773V607.735H16V773H18Z"
			className="fill-primary"
			mask="url(#path-2-inside-1_1_196)"
		  />
		  <mask id="path-4-inside-2_1_196" fill="white">
			<path d="M520 182.265L399.717 182.265L399.717 17.0002L520 17.0002L520 182.265Z" />
		  </mask>
		  <path
			d="M520 17.0002L521 17.0002L521 16.0002L520 16.0002L520 17.0002ZM399.717 18.0002L520 18.0002L520 16.0002L399.717 16.0002L399.717 18.0002ZM519 17.0002L519 182.265L521 182.265L521 17.0002L519 17.0002Z"
			className="fill-primary"
			mask="url(#path-4-inside-2_1_196)"
		  />
		</svg>
		<div className="content absolute top-0 left-0 w-full h-full flex flex-col gap-10 items-center p-5">
		  {children}
		</div>
	  </div>
	  </div>
	  </div>
	  </div>
		</>
	);
  };
  