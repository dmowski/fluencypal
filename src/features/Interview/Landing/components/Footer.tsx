"use client";
import { Link, Stack, Typography } from "@mui/material";
import {
  fullEnglishLanguageName,
  SupportedLanguage,
  supportedLanguages,
} from "@/features/Lang/lang";
import { usePathname, useSearchParams } from "next/navigation";
import { useLingui } from "@lingui/react";
import { Suspense } from "react";
import { maxLandingWidth } from "@/features/Landing/landingSettings";
import { getUrlStart, getUrlStartWithoutLastSlash } from "@/features/Lang/getUrlStart";

interface FooterProps {
  lang: SupportedLanguage;
}
const FooterComponent: React.FC<FooterProps> = ({ lang }) => {
  const { i18n } = useLingui();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onlyPathname = pathname || "/";
  const onlyQuery = searchParams.toString() || "";

  const pathNameAndQuery = onlyPathname + (onlyQuery ? `?${onlyQuery}` : "");

  const pathnameWithoutLang =
    lang === "en" && !pathNameAndQuery.startsWith("/en")
      ? pathNameAndQuery || "/"
      : pathNameAndQuery.replace(`/${lang}`, "") || "/";

  const pathWithoutFirstSlash = pathnameWithoutLang.startsWith("/")
    ? pathnameWithoutLang.slice(1)
    : pathnameWithoutLang;
  return (
    <Stack
      component={"footer"}
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 0 50px 0",
        //backgroundColor: "#070f1a",
        backgroundColor: `#0a121e`,
        //backgroundColor: `rgba(10, 18, 30, 1)`,
        borderTop: "1px solid rgba(255, 255, 255, 0.2)",
        marginTop: "0px",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Stack
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr 1fr",
          alignItems: "center",
          padding: "0 10px",

          boxSizing: "border-box",
          gap: "25px",
          width: "100%",
          justifyContent: "space-between",
          maxWidth: maxLandingWidth,
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
            gap: "10px",
            a: {
              fontWeight: 500,
              color: "#fff",
              textUnderlineOffset: "3px",
              textDecorationColor: "#fff",
            },
          }}
        >
          <Link href={`${getUrlStart(lang)}contacts`} variant="body1">
            {i18n._(`Contacts`)}
          </Link>
          <Link href={`#pricing`} variant="body1">
            {i18n._(`Price`)}
          </Link>
        </Stack>

        <Stack
          sx={{
            gap: "10px",
            alignItems: "center",
            "@media (max-width: 900px)": {
              alignItems: "flex-start",
            },
          }}
        >
          <img
            src="/logo.svg"
            alt="Online English Learning"
            width="200px"
            height="37px"
            style={{
              opacity: 0.92,
            }}
          />
        </Stack>
        <Stack
          sx={{
            alignItems: "flex-end",
            justifyContent: "center",
            "@media (max-width: 900px)": {
              alignItems: "flex-start",
            },
          }}
        >
          <Typography variant="body1">FluencyPal</Typography>
          <Typography variant="body1">© 2025</Typography>
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: "2px 10px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`${getUrlStart(lang)}terms`}
              variant="body1"
              align="right"
              sx={{
                color: "#fff",
              }}
            >
              {i18n._(`Terms of Use`)}
            </Link>
            <Link
              href={`${getUrlStart(lang)}privacy`}
              variant="body1"
              align="right"
              sx={{
                color: "#fff",
              }}
            >
              {i18n._(`Privacy Policy`)}
            </Link>
          </Stack>
        </Stack>
      </Stack>
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
