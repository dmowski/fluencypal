export const GoogleMeetIcon = () => (
  <svg
    width="36"
    height="28"
    viewBox="0 0 176 138"
    fill="none"
    aria-hidden
    data-testid="fluency-call-meet-icon"
    style={{ width: 36, height: 28, flexShrink: 0 }}
  >
    <path
      fill="url(#fluency-meet-lens)"
      d="M102.015 81.88c-6.829-4.718-6.921-14.778-1.179-19.62L157 22.643c7.94-5.701 19-.038 19 9.737v77.755c0 9.675-10.861 15.359-18.821 9.859z"
    />
    <path
      fill="url(#fluency-meet-body)"
      d="M0 44C0 19.7 19.7 0 44 0h64c11.046 0 20 8.954 20 20v98c0 11.046-8.954 20-20 20H20C8.954 138 0 129.046 0 118z"
    />
    <mask
      id="fluency-meet-shine-mask"
      width="129"
      height="138"
      x="8"
      y="27"
      maskUnits="userSpaceOnUse"
    >
      <path
        fill="#fff"
        d="M8 71c0-24.3 19.7-44 44-44h64c11.046 0 20 8.954 20 20v98c0 11.046-8.954 20-20 20H28c-11.046 0-20-8.954-20-20z"
      />
    </mask>
    <g
      filter="url(#fluency-meet-blur)"
      mask="url(#fluency-meet-shine-mask)"
      transform="translate(-8 -27)"
    >
      <path fill="url(#fluency-meet-shine)" d="M73.906 99.198 183.906 36v124z" />
    </g>
    <circle cx="30" cy="108" r="14" fill="#fff" />
    <defs>
      <linearGradient
        id="fluency-meet-lens"
        x1="128.8"
        x2="227.2"
        y1="104.44"
        y2="104.44"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(-8 -27)"
      >
        <stop stopColor="#f6a100" />
        <stop offset="1" stopColor="#ffbe00" />
      </linearGradient>
      <linearGradient
        id="fluency-meet-shine"
        x1="136.22"
        x2="78.5"
        y1="91.32"
        y2="91.19"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset=".15" stopColor="#ffb5e8" />
        <stop offset="1" stopColor="#ffdbf5" stopOpacity="0" />
      </linearGradient>
      <radialGradient
        id="fluency-meet-body"
        cx="0"
        cy="0"
        r="1"
        gradientTransform="matrix(-159.725 0 0 -135.852 152.325 69)"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset=".15" stopColor="#ffe921" />
        <stop offset="1" stopColor="#fec700" />
      </radialGradient>
      <filter
        id="fluency-meet-blur"
        width="166"
        height="180"
        x="45.91"
        y="8"
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
  </svg>
);
