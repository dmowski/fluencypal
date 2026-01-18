"use client";

import { useState, useEffect, ForwardRefExoticComponent, RefAttributes } from "react";
import { useAuth } from "../Auth/useAuth";
import { Avatar, Button, Stack, Typography } from "@mui/material";
import {
  ChevronRight,
  Landmark,
  Languages,
  LogOut,
  LucideProps,
  MessageCircleQuestionMark,
  Speech,
  Star,
  Wallet,
} from "lucide-react";

import { useUsage } from "../Usage/useUsage";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useLingui } from "@lingui/react";
import { LanguageSwitcher } from "../Lang/LanguageSwitcher";
import { useSettings } from "./useSettings";
import { isTMA } from "@telegram-apps/sdk-react";
import { useUrlParam } from "../Url/useUrlParam";
import { NeedHelpModal } from "../Header/NeedHelpModal";
import { PaymentHistoryModal } from "../Header/PaymentHistoryModal";
import { ContactMessageModal } from "../Header/ContactMessageModal";
import { Trans } from "@lingui/react/macro";
import { useRouter } from "next/navigation";
import { getUrlStart } from "../Lang/getUrlStart";
import { GameMyAvatar } from "../Game/GameMyAvatar";
import { GameMyUsername } from "../Game/GameMyUsername";
import { useTeacherSettings } from "../Conversation/CallMode/useTeacherSettings";

export function MyProfile({ lang }: { lang: SupportedLanguage }) {
  const auth = useAuth();
  const settings = useSettings();

  const { i18n } = useLingui();
  const [isShowLogout, setIsShowLogout] = useState(true);
  const teacherSettings = useTeacherSettings();

  useEffect(() => {
    const isTelegramApp = isTMA();
    if (!isTelegramApp) {
      return;
    }
    setTimeout(() => {
      setIsShowLogout(false);
    }, 10);
  }, []);

  const [isShowHelpModal, setIsShowHelpModal] = useUrlParam("help");
  const [isShowRefundModal, setIsShowRefundModal] = useUrlParam("refund");
  const [isShowPaymentHistoryModal, setIsShowPaymentHistoryModal] = useUrlParam("paymentHistory");
  const [isShowFeedbackModal, setIsShowFeedbackModal] = useUrlParam("feedback");

  const usage = useUsage();
  const [_, setIsShowModal] = useUrlParam("lang-selection");
  const router = useRouter();

  interface MenuItem {
    title: string;
    subTitle: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    onClick: () => void;
  }

  const menuItems: MenuItem[] = [
    {
      title: i18n._(`Language`),
      subTitle: i18n._(`Select your preferred language`),
      icon: Languages,
      onClick: () => setIsShowModal(true),
    },
    {
      title: i18n._(`AI Voice`),
      subTitle: i18n._(`Choose the voice for your AI teacher`),
      icon: Speech,
      onClick: () => {
        teacherSettings.openSettingsModal();
      },
    },

    {
      title: i18n._(`Full Access`),
      subTitle: i18n._(`Manage your full access settings`),
      icon: Wallet,
      onClick: () => {
        usage.togglePaymentModal(true);
      },
    },
    {
      title: i18n._(`Feedback`),
      subTitle: i18n._(`Give us your feedback`),
      icon: Star,
      onClick: () => {
        setIsShowFeedbackModal(true);
      },
    },
    {
      title: i18n._(`Help`),
      subTitle: i18n._(`Need help?`),
      icon: MessageCircleQuestionMark,
      onClick: () => {
        setIsShowHelpModal(true);
      },
    },
    {
      title: i18n._(`Payment History`),
      subTitle: i18n._(`View your payment history. Refunds`),
      icon: Landmark,
      onClick: () => {
        setIsShowPaymentHistoryModal(true);
      },
    },
  ];

  if (isShowLogout) {
    menuItems.push({
      title: i18n._(`Log Out`),
      subTitle: i18n._(`Log out of your account`),
      icon: LogOut,
      onClick: async () => {
        router.push(getUrlStart(lang));
        setTimeout(async () => {
          await auth.logout();
        }, 300);
      },
    });
  }

  return (
    <>
      <Stack
        sx={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: "0px 10px 0 10px",
          gap: "50px",
        }}
      >
        <Stack
          sx={{
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <Stack
            sx={{
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <GameMyAvatar />
            <GameMyUsername align="center" />
          </Stack>

          <Typography
            variant="caption"
            align="center"
            sx={{
              opacity: 0.7,
              padding: "0 10px 20px 10px",
            }}
          >
            {i18n._(`Manage your profile settings and check your progress`)}
          </Typography>
        </Stack>

        <Stack
          sx={{
            width: "100%",
            maxWidth: "700px",
            gap: "0px",
            backgroundColor: "rgba(32, 40, 50, 0.21)",

            borderRadius: "8px",
            boxShadow: "0 0 0 1px rgba(250, 250, 250, 0.1)",
            padding: "0",
          }}
        >
          {menuItems.map((item, index) => {
            const isFirst = index === 0;
            const isLast = index === menuItems.length - 1;

            return (
              <Button
                key={item.title}
                onClick={item.onClick}
                sx={{
                  borderTopLeftRadius: isFirst ? "8px" : "0px",
                  borderTopRightRadius: isFirst ? "8px" : "0px",
                  borderBottomLeftRadius: isLast ? "8px" : "0px",
                  borderBottomRightRadius: isLast ? "8px" : "0px",

                  padding: "15px 20px",
                  ":hover": {
                    backgroundColor: "rgba(250, 250, 250, 0.1)",
                  },
                  display: "grid",
                  gap: "10px",
                  gridTemplateColumns: "max-content 1fr max-content",
                  alignItems: "center",
                  borderTop: index > 0 ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
                }}
              >
                <item.icon size="30px" color="rgba(255, 255, 255, 0.7)" />
                <Stack
                  sx={{
                    alignItems: "flex-start",
                    paddingLeft: "10px",
                    color: "#fff",
                  }}
                >
                  <Typography align="left">{item.title}</Typography>
                  <Typography
                    variant="caption"
                    align="left"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    {item.subTitle}
                  </Typography>
                </Stack>
                <ChevronRight color="rgba(255, 255, 255, 0.7)" />
              </Button>
            );
          })}
        </Stack>
      </Stack>

      {isShowHelpModal && <NeedHelpModal onClose={() => setIsShowHelpModal(false)} lang={lang} />}
      {isShowPaymentHistoryModal && (
        <PaymentHistoryModal onClose={() => setIsShowPaymentHistoryModal(false)} />
      )}

      {isShowRefundModal && (
        <ContactMessageModal
          title={i18n._(`Refund`)}
          subTitle={i18n._(`Add some info why you want a refund and we will do it.`)}
          placeholder={i18n._(`Leave your message`)}
          onClose={() => setIsShowRefundModal(false)}
        />
      )}

      {isShowFeedbackModal && (
        <ContactMessageModal
          title={i18n._(`Feedback`)}
          subTitle={i18n._(`We appreciate your feedback!`)}
          placeholder={i18n._(`Leave your message`)}
          onClose={() => setIsShowFeedbackModal(false)}
        />
      )}

      <LanguageSwitcher
        isHidden
        isAuth={auth.isAuthorized}
        langToLearn={settings.languageCode || "en"}
        setLanguageToLearn={settings.appMode === "learning" ? settings.setLanguage : undefined}
        setPageLanguage={settings.setPageLanguage}
        nativeLang={settings.userSettings?.nativeLanguageCode || "en"}
        setNativeLanguage={settings.setNativeLanguage}
      />
    </>
  );
}
