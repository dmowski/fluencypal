import { Button, Link, Stack, Typography } from "@mui/material";
import { useAuth } from "../Auth/useAuth";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Cookie, ReceiptText, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { deleteCollectionDocs, firestore } from "../Firebase/init";
import { doc, DocumentReference, setDoc } from "firebase/firestore";
import { UserSettings } from "@/common/user";
import { useNotifications } from "@toolpad/core/useNotifications";
import { ContactList } from "../Landing/Contact/ContactList";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getUrlStart } from "../Lang/getUrlStart";
import { useLingui } from "@lingui/react";

interface NeedHelpModalProps {
  onClose: () => void;
  lang: SupportedLanguage;
}

export const NeedHelpModal = ({ onClose, lang }: NeedHelpModalProps) => {
  const auth = useAuth();
  const [isShowDeleteAccountModal, setIsShowDeleteAccountModal] = useState(false);
  const { i18n } = useLingui();
  const userId = auth.uid;
  const notifications = useNotifications();
  const userSettingsDoc = useMemo(() => {
    return userId ? (doc(firestore, `users/${userId}`) as DocumentReference<UserSettings>) : null;
  }, [userId]);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const onDeleteAccount = async () => {
    if (!userId || !userSettingsDoc) return;
    const confirm = window.confirm(i18n._(`Are you sure you want to delete your account?`));
    if (!confirm) return;

    setIsDeletingAccount(true);

    try {
      await deleteCollectionDocs(`users/${userId}/conversations`);
      await deleteCollectionDocs(`users/${userId}/homeworks`);
      await deleteCollectionDocs(`users/${userId}/stats`);
      await deleteCollectionDocs(`users/${userId}/phraseCorrections`);
      await deleteCollectionDocs(`users/${userId}/goals`);

      await setDoc(userSettingsDoc, { languageCode: null }, { merge: true });
      notifications.show(
        i18n._(`Your account has been successfully deleted. We are sorry to see you go!`),
        {
          severity: "success",
          autoHideDuration: 10_000,
        }
      );

      auth.logout();
      onClose();
    } catch (error) {
      setIsDeletingAccount(false);
      notifications.show(
        i18n._(`Failed to delete your account. Please try again later, or contact the developers.`),
        {
          severity: "error",
          autoHideDuration: 10_000,
        }
      );

      throw error;
    }

    setIsDeletingAccount(false);
  };

  return (
    <CustomModal isOpen={true} onClose={() => onClose()} width="100dvw" padding="0">
      <Stack
        sx={{
          gap: "30px",
          padding: "30px",
          height: "100dvh",
          maxHeight: "100dvh",
          boxSizing: "border-box",
          width: "100%",
          "@media (max-width: 600px)": {
            padding: "15px",
          },
        }}
      >
        <Stack>
          <Typography variant="h5" component="h2">
            {i18n._(`Need help?`)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
            }}
          >
            {i18n._(
              `My name is Alex. I am the founder of this project. You will find my contacts below.`
            )}
          </Typography>
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            gap: "50px",
            width: "100%",
            maxWidth: "800px",
            "@media (max-width: 600px)": {
              flexDirection: "column",
              gap: "50px",
            },
          }}
        >
          <Stack
            gap={"10px"}
            sx={{
              width: "100%",
            }}
          >
            <Typography>{i18n._(`Contacts:`)}</Typography>

            <ContactList />
          </Stack>

          <Stack
            gap={"10px"}
            sx={{
              width: "100%",
            }}
          >
            <Typography
              sx={{
                opacity: 1,
              }}
            >
              {i18n._(`Legal:`)}
            </Typography>

            <Stack gap={"10px"}>
              <Stack
                sx={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "10px",
                }}
              >
                <ReceiptText />
                <Typography>
                  <Link href={`${getUrlStart(lang)}terms`}>{i18n._(`Terms of Use`)}</Link>
                </Typography>
              </Stack>

              <Stack
                sx={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "10px",
                }}
              >
                <Cookie />
                <Typography>
                  <Link href={`${getUrlStart(lang)}privacy`}>{i18n._(`Privacy Policy`)}</Link>
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
        {isShowDeleteAccountModal ? (
          <Stack
            sx={{
              width: "100%",
              alignItems: "flex-start",
              gap: "20px",
              marginTop: "20px",
              maxWidth: "800px",
            }}
          >
            <Stack>
              <Typography variant="h5">
                {i18n._(`Are you sure you want to delete your account?`)}
              </Typography>
              <Typography variant="caption">{i18n._(`This action is irreversible.`)}</Typography>
              <Typography variant="caption">
                {i18n._(`We will delete your data, but information about your balance will be stored for one
              year.`)}
              </Typography>
              <Typography variant="caption">
                {i18n._(
                  `If you want to remove all information, including your balance, please contact us.`
                )}
              </Typography>
            </Stack>

            <Stack
              sx={{
                flexDirection: "row",
                gap: "10px",
              }}
            >
              <Button
                disabled={isDeletingAccount}
                onClick={() => {
                  onDeleteAccount();
                }}
                color="error"
                variant="contained"
                startIcon={<Trash size={"18px"} />}
              >
                {isDeletingAccount ? i18n._(`Deleting...`) : i18n._(`Yes, Delete account`)}
              </Button>

              <Button
                disabled={isDeletingAccount}
                onClick={() => {
                  setIsShowDeleteAccountModal(false);
                }}
                startIcon={<Trash size={"18px"} />}
              >
                {i18n._(`Cancel`)}
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack
            sx={{
              flexDirection: "row",
              width: "100%",
              justifyContent: "space-between",
              paddingTop: "20px",
            }}
          >
            <Button onClick={onClose} variant="outlined" color="primary">
              {i18n._(`Close`)}
            </Button>
            <Button
              disabled={isDeletingAccount}
              onClick={() => {
                setIsShowDeleteAccountModal(true);
              }}
              color="error"
              startIcon={<Trash size={"18px"} />}
            >
              {isDeletingAccount ? i18n._(`Deleting...`) : i18n._(`Delete account`)}
            </Button>
          </Stack>
        )}
      </Stack>
    </CustomModal>
  );
};
