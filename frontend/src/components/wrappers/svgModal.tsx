import { BackgroundGlow } from '../BackgroundGlow';

export const SVGModal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="p-0 m-0 relative inline-block overflow-hidden">
      <div className="relative w-full text-blue p-0 m-0 ">
        <div className="svg-card-wrapper w-full grid place-items-center text-center">
          <BackgroundGlow></BackgroundGlow>
          <svg
            className="w-full h-auto col-start-1 row-start-1"
            height="549"
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
          </svg>

          {/* Content on top of SVG */}
          <div className="content col-start-1 row-start-1 flex flex-col gap-10">{children}</div>
        </div>
      </div>
    </div>
  );
};
