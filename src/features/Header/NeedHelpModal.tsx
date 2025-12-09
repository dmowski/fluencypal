import { Button, Link, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { Cookie, ReceiptText, Trash } from "lucide-react";
import { useState } from "react";
import { ContactList } from "../Landing/Contact/ContactList";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getUrlStart } from "../Lang/getUrlStart";
import { useLingui } from "@lingui/react";
import { useDeleteAccount } from "../Auth/useDeleteAccount";
import { isTMA } from "@telegram-apps/sdk-react";

interface NeedHelpModalProps {
  onClose: () => void;
  lang: SupportedLanguage;
}

export const NeedHelpModal = ({ onClose, lang }: NeedHelpModalProps) => {
  const isTelegramApp = isTMA();
  const urlPathToRedirect = isTelegramApp ? getUrlStart(lang) + "tg" : getUrlStart(lang);

  const deleteAccount = useDeleteAccount({ onClose, startPage: urlPathToRedirect });
  const { i18n } = useLingui();
  const [isShowDeleteAccountModal, setIsShowDeleteAccountModal] = useState(false);

  return (
    <CustomModal isOpen={true} onClose={() => onClose()}>
      <Stack
        sx={{
          gap: "30px",
          width: "100%",
          maxWidth: "600px",
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
                disabled={deleteAccount.isDeletingAccount}
                onClick={() => {
                  deleteAccount.onDeleteAccount();
                }}
                color="error"
                variant="contained"
                startIcon={<Trash size={"18px"} />}
              >
                {deleteAccount.isDeletingAccount
                  ? i18n._(`Deleting...`)
                  : i18n._(`Yes, Delete account`)}
              </Button>

              <Button
                disabled={deleteAccount.isDeletingAccount}
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
              disabled={deleteAccount.isDeletingAccount}
              onClick={() => setIsShowDeleteAccountModal(true)}
              color="error"
              startIcon={<Trash size={"18px"} />}
            >
              {deleteAccount.isDeletingAccount
                ? i18n._(`Deleting...`)
                : deleteAccount.isTotalDelete
                ? i18n._(`Delete account (Total)`)
                : i18n._(`Delete account`)}
            </Button>
          </Stack>
        )}
      </Stack>
    </CustomModal>
  );
};
