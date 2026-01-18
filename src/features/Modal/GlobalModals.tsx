"use client";

import { useMemo } from "react";
import { useGame } from "../Game/useGame";
import { UserProfileModal } from "../Game/UserProfileModal";
import { useUsage } from "../Usage/useUsage";
import { SubscriptionPaymentModal } from "../Usage/SubscriptionPaymentModal";
import { useAuth } from "../Auth/useAuth";
import { useTeacherSettings } from "../Conversation/CallMode/useTeacherSettings";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Button, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { SelectTeacher } from "../Conversation/CallMode/SelectTeacher";
import { useSettings } from "../Settings/useSettings";
import { Check } from "lucide-react";

export const GlobalModals: React.FC = () => {
  const game = useGame();
  const usage = useUsage();
  const auth = useAuth();
  const { i18n } = useLingui();
  const settings = useSettings();

  const teacherSettings = useTeacherSettings();

  const activeUserProfile = useMemo(() => {
    return game.modalUserId ? game.stats.find((s) => s.userId === game.modalUserId) : null;
  }, [game.modalUserId, auth.uid, game.isLoading]);

  return (
    <>
      {usage.isShowPaymentModal && <SubscriptionPaymentModal />}

      {activeUserProfile && (
        <UserProfileModal stat={activeUserProfile} onClose={() => game.showUserInModal("")} />
      )}

      {teacherSettings.isSettingsModalOpen && (
        <CustomModal isOpen={true} onClose={teacherSettings.closeSettingsModal}>
          <Stack
            sx={{
              gap: "30px",
              maxWidth: "700px",
              padding: "20px 0px 30px 0px",
              alignItems: "flex-start",
            }}
          >
            <Stack>
              <Typography variant="h5">{i18n._("Your AI teacher voice:")}</Typography>
              <Typography
                sx={{
                  opacity: 0.7,
                }}
                variant="body2"
              >
                {i18n._(
                  "Select the voice your AI teacher will use during conversations. You can change this anytime."
                )}
              </Typography>
            </Stack>
            <SelectTeacher
              selectedVoice={settings.userSettings?.teacherVoice}
              onSelectVoice={settings.setVoice}
            />
            <Button
              size="large"
              color="info"
              variant="contained"
              startIcon={<Check />}
              onClick={teacherSettings.closeSettingsModal}
            >
              {i18n._("Done")}
            </Button>
          </Stack>
        </CustomModal>
      )}
    </>
  );
};
