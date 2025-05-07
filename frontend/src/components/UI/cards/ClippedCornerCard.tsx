import { BackgroundGlow, ClippedCornerCardSVG } from '@components/visual';

export const ClippedCornerCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  console.log('is safari:', isSafari);

  return !isSafari ? (
    <div className="svg-card-wrapper relative w-full h-full min-w-[300px] grid overflow-hidden place-items-center text-center">
      <BackgroundGlow></BackgroundGlow>
      <ClippedCornerCardSVG></ClippedCornerCardSVG>
      {/* Content on top of SVG */}
      <div className="content col-start-1 row-start-1 flex flex-col gap-10">{children}</div>
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
