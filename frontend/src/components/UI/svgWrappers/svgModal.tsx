import { BackgroundGlow } from '../../visual/BackgroundGlow';

export const SVGModal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  console.log('is safari:', isSafari);

  return !isSafari ? (
    <div className="p-0 m-0 relative inline-block overflow-hidden  w-full h-full">
      <div className="relative w-full h-full text-blue p-0 m-0 ">
        <div className="svg-card-wrapper w-full h-full grid place-items-center text-center">
          <BackgroundGlow></BackgroundGlow>
          <svg
            className="w-full h-full col-start-1 row-start-1"
            viewBox="0 0 549 814"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <g filter="url(#filter0_d_1_197)">
              <path
                d="M54.3666 9L1 77.2251V797H485.302L536 732.186V9H54.3666Z"
                className="currentColor"
                fill="currentColor"
                fillOpacity="0.15"
              />
              <path
                d="M54.3666 9L1 77.2251V797H485.302L536 732.186V9H54.3666Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </g>
          </svg>

          {/* Content on top of SVG */}
          <div className="content col-start-1 row-start-1 flex flex-col gap-10">{children}</div>
        </div>
      </div>
    </div>
  ) : (
    <>
      <div className="glass-box w-full h-full relative overflow-hidden p-10">
        <BackgroundGlow></BackgroundGlow>
        {children}
      </div>
    </>
  );
};
