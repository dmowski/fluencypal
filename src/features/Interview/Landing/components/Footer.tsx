"use client";
import { IconButton, Link, Stack, Typography } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import { SupportedLanguage } from "@/features/Lang/lang";
import { usePathname, useSearchParams } from "next/navigation";
import { useLingui } from "@lingui/react";
import { Suspense } from "react";
import { maxLandingWidth } from "@/features/Landing/landingSettings";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import { CONTACTS } from "@/features/Landing/Contact/data";

interface FooterProps {
  lang: SupportedLanguage;
}
const FooterComponent: React.FC<FooterProps> = ({ lang }) => {
  const { i18n } = useLingui();

  return (
    <Stack
      component={"footer"}
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 0 0px 0",
        //backgroundColor: "#070f1a",
        backgroundColor: `#0a121e`,
        //backgroundColor: `rgba(10, 18, 30, 1)`,
        borderTop: "1px solid rgba(255, 255, 255, 0.2)",
        marginTop: "0px",
        position: "relative",
        zIndex: 1,
        ".link": {
          fontWeight: 500,
          fontSize: "12px",
          color: "rgba(255, 255, 255, 0.7)",
          textDecoration: "none",
          marginBottom: "8px",
        },
        ".section-title": {
          fontWeight: 500,
          marginBottom: "20px",
          fontSize: "16px",
        },
      }}
    >
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: "5fr 2fr 1fr",
          padding: "0 10px",
          maxWidth: "1259px",
          gap: "25px",
          width: "100%",
          justifyContent: "space-between",

          position: "relative",
          zIndex: 9999,
          "@media (max-width: 900px)": {
            gridTemplateColumns: "1fr",
            gap: "70px",
          },
        }}
      >
        <Stack
          sx={{
            alignItems: "flex-start",
            justifyContent: "flex-start",
            gap: "5px",
          }}
        >
          <img
            src="/logo.svg"
            alt="Online English Learning"
            width="160px"
            style={{
              aspectRatio: "200/37",
              opacity: 0.92,
              marginBottom: "10px",
            }}
          />
          <Typography variant="caption" sx={{ maxWidth: "300px", opacity: 0.7, fontSize: "11px" }}>
            {i18n._(`AI-powered interview preparation that helps you get more job offers.`)}
          </Typography>
          <Stack
            sx={{
              flexDirection: "row",
              gap: "0px",
              marginLeft: "-8px",
            }}
          >
            <IconButton
              target="_blank"
              href={`${CONTACTS.instagram}`}
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <InstagramIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
            </IconButton>
            <IconButton href={`mailto:${CONTACTS.email}`} aria-label="Email">
              <AlternateEmailIcon sx={{ color: "rgba(255, 255, 255, 0.7)" }} />
            </IconButton>
          </Stack>
        </Stack>

        <Stack>
          <Typography className="section-title">{i18n._(`Product`)}</Typography>

          <Link href={`#steps`} className="link" variant="body1">
            {i18n._(`How it Works`)}
          </Link>
          <Link href={`#reviews`} className="link" variant="body1">
            {i18n._(`Success stories`)}
          </Link>
          <Link href={`#price`} className="link" variant="body1">
            {i18n._(`Price`)}
          </Link>
        </Stack>

        <Stack>
          <Typography className="section-title">{i18n._(`Company`)}</Typography>

          <Link href={`${getUrlStart(lang)}contacts`} variant="body1" className="link">
            {i18n._(`Contacts`)}
          </Link>
          <Link href={`${getUrlStart(lang)}terms`} variant="body1" className="link">
            {i18n._(`Terms of Use`)}
          </Link>
          <Link href={`${getUrlStart(lang)}privacy`} variant="body1" className="link">
            {i18n._(`Privacy Policy`)}
          </Link>
        </Stack>
      </Stack>

      <Stack
        sx={{
          width: "calc(100% - 20px)",
          maxWidth: maxLandingWidth,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          margin: "30px 0 30px 0",
        }}
      />

      <Typography
        sx={{
          fontSize: "11px",
          opacity: 0.7,
          paddingBottom: "30px",
        }}
      >
        © 2025 FluencyPal. All rights reserved.
      </Typography>
    </Stack>
  );
};

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  return (
    <Suspense>
      <FooterComponent lang={lang} />
    </Suspense>
  );
};
