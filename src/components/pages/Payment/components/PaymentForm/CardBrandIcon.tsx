import React from "react";

function VisaIcon() {
  return (
    <svg viewBox="0 0 48 32" width="48" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <text
        x="24"
        y="22"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="14"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        VISA
      </text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 48 32" width="48" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#252525" />
      <circle cx="18" cy="16" r="9" fill="#EB001B" />
      <circle cx="30" cy="16" r="9" fill="#F79E1B" />
      <path
        d="M24 8.8a9 9 0 0 1 0 14.4A9 9 0 0 1 24 8.8z"
        fill="#FF5F00"
      />
    </svg>
  );
}

function AmexIcon() {
  return (
    <svg viewBox="0 0 48 32" width="48" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#2E77BC" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="9"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        AMERICAN
      </text>
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="9"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        EXPRESS
      </text>
    </svg>
  );
}

function EloIcon() {
  return (
    <svg viewBox="0 0 48 32" width="48" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#000000" />
      <text
        x="24"
        y="22"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="16"
        fill="#FFD700"
      >
        elo
      </text>
    </svg>
  );
}

function HipercardIcon() {
  return (
    <svg viewBox="0 0 48 32" width="48" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#B22222" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="8"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        HIPER
      </text>
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="8"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        CARD
      </text>
    </svg>
  );
}

function DinersIcon() {
  return (
    <svg viewBox="0 0 48 32" width="48" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#004A97" />
      <text
        x="24"
        y="20"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="8"
        fill="#FFFFFF"
        letterSpacing="0.3"
      >
        DINERS
      </text>
      <text
        x="24"
        y="29"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="8"
        fill="#FFFFFF"
        letterSpacing="0.3"
      >
        CLUB
      </text>
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg viewBox="0 0 48 32" width="48" height="32" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E0E0E0" />
      <circle cx="34" cy="16" r="10" fill="#F76F20" />
      <text
        x="13"
        y="20"
        fontFamily="Arial, sans-serif"
        fontWeight="bold"
        fontSize="7"
        fill="#231F20"
      >
        DISCOVER
      </text>
    </svg>
  );
}

const icons: Record<string, React.ReactNode> = {
  Visa: <VisaIcon />,
  MasterCard: <MastercardIcon />,
  Amex: <AmexIcon />,
  Elo: <EloIcon />,
  Hipercard: <HipercardIcon />,
  Diners: <DinersIcon />,
  Discover: <DiscoverIcon />,
};

export default function CardBrandIcon({ brand }: { brand: string | null }) {
  if (!brand || !icons[brand]) return null;
  return (
    <span style={{ display: "flex", alignItems: "center", paddingRight: 4 }}>
      {icons[brand]}
    </span>
  );
}
