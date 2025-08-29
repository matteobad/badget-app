export const DotRaster = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={8} height={8} fill="none">
      <mask
        id="a"
        width={8}
        height={8}
        x={0}
        y={0}
        maskUnits="userSpaceOnUse"
        style={{
          maskType: "alpha",
        }}
      >
        <circle cx={4} cy={4} r={4} fill="#D9D9D9" />
      </mask>
      <g fill="currentColor" mask="url(#a)">
        <path d="m4.58-1.398.717.698-6.28 6.447-.717-.698zM7.27-.072l.716.698L.45 8.363l-.716-.698zM9.962 1.255l.717.698-8.045 8.258-.717-.698z" />
      </g>
    </svg>
  );
};
