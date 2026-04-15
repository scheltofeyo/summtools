function Frame1() {
  return (
    <div className="absolute bg-[#d1cef7] font-['Inter:Regular',sans-serif] font-normal h-[1024px] leading-[normal] left-0 not-italic overflow-clip text-[36.444px] top-0 w-[1440px]">
      <p className="absolute left-[119px] text-[#221687] top-[313px]">Full name</p>
      <p className="absolute left-[122px] text-black top-[253px]">Winner!</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="absolute bg-[#d1cef7] h-[134px] left-0 overflow-clip top-[1072px] w-[1440px]">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[119px] not-italic text-[#221687] text-[36.444px] top-[45px]">Full name</p>
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute bg-white h-[1024px] left-0 overflow-clip top-0 w-[1440px]">
      <Frame1 />
      <Frame2 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="bg-[#eb1414] content-stretch flex items-center justify-center p-[10px] relative shrink-0">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[36.444px] text-white">Randomize next!</p>
    </div>
  );
}

function Frame3() {
  return (
    <div className="h-[29px] relative shrink-0 w-[52px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 52 29">
        <g id="Frame 20">
          <rect fill="var(--fill-0, white)" height="29" rx="14.5" width="52" />
          <circle cx="14.5" cy="14.5" fill="var(--fill-0, #E81919)" id="Ellipse 1" r="10.5" />
        </g>
      </svg>
    </div>
  );
}

function Frame5() {
  return (
    <div className="absolute content-center flex flex-wrap gap-[19px_8px] items-center justify-center left-[611px] top-[872px] w-[280px]">
      <Frame4 />
      <Frame3 />
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[16px] text-black">Remove winners from list</p>
    </div>
  );
}

export default function Frame6() {
  return (
    <div className="relative size-full">
      <Frame />
      <Frame5 />
    </div>
  );
}