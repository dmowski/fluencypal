"use client";

import { useState } from "react";
import { useAuth } from "../Auth/useAuth";
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { Cookie, Languages, LogOutIcon, MessageCircleQuestion, ReceiptText, X } from "lucide-react";
import InstagramIcon from "@mui/icons-material/Instagram";
import MailIcon from "@mui/icons-material/Mail";
import { useSettings } from "../Settings/useSettings";
import { fullEnglishLanguageName } from "@/common/lang";
import { CustomModal } from "../Modal/CustomModal";
import { LangSelector } from "../Lang/LangSelector";

export function Header() {
  const auth = useAuth();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isShowLangSelector, setIsShowLangSelector] = useState(false);
  const [isShowHelpModal, setIsShowHelpModal] = useState(false);
  const settings = useSettings();

  const userPhoto = auth.userInfo?.photoURL || "";
  const userName = auth.userInfo?.displayName || "";

  return (
    <Stack
      sx={{
        width: "100%",
        alignItems: "center",
        justifyContent: "center",

        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <Stack
        sx={{
          maxWidth: "1400px",
          width: "100%",
          gap: "10px",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a
          href="/"
          style={{
            padding: "20px 20px 20px 0",
          }}
        >
          <img
            src="./logo.png"
            alt="logo"
            style={{
              maxWidth: "100px",
              height: "auto",
            }}
          />
        </a>

        {!auth.loading && (
          <>
            {auth.isAuthorized ? (
              <IconButton
                onClick={(e) => {
                  setMenuAnchor(e.currentTarget);
                }}
              >
                <Avatar alt={userName} src={userPhoto} />
              </IconButton>
            ) : (
              <Button href="/practice" variant="outlined">
                Sign in
              </Button>
            )}
          </>
        )}

        <Menu
          anchorEl={menuAnchor}
          open={!!menuAnchor}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <MenuItem
            onClick={() => {
              setIsShowLangSelector(true);
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <Languages size="20px" />
            </ListItemIcon>
            <ListItemText>
              {settings.language
                ? `${fullEnglishLanguageName[settings.language]} | Change language`
                : "Set language to learn"}
            </ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => {
              setIsShowHelpModal(true);
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <MessageCircleQuestion size="20px" />
            </ListItemIcon>
            <ListItemText>{`Need Help?`}</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={() => {
              auth.logout();
              setMenuAnchor(null);
            }}
          >
            <ListItemIcon>
              <LogOutIcon size="20px" />
            </ListItemIcon>
            <ListItemText>{`Logout`}</ListItemText>
          </MenuItem>
        </Menu>
      </Stack>

      <CustomModal
        isOpen={isShowLangSelector}
        onClose={() => setIsShowLangSelector(false)}
        width="400px"
      >
        <Typography id="modal-modal-title" variant="h4" component="h2">
          Language to learn
        </Typography>
        <Stack
          sx={{
            width: "100%",
          }}
        >
          <LangSelector
            value={settings.language}
            onDone={(lang) => {
              settings.setLanguage(lang);
              setIsShowLangSelector(false);
            }}
            confirmButtonLabel="Save"
          />
        </Stack>
      </CustomModal>

      <CustomModal isOpen={isShowHelpModal} onClose={() => setIsShowHelpModal(false)}>
        <Typography id="modal-modal-title" variant="h4" component="h2">
          Need help?
        </Typography>

        <Stack
          sx={{
            flexDirection: "row",
            gap: "50px",
            width: "100%",
          }}
        >
          <Stack
            gap={"10px"}
            sx={{
              width: "100%",
            }}
          >
            <Typography>Contacts:</Typography>

            <Stack gap={"10px"}>
              <Stack
                sx={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "10px",
                }}
              >
                <MailIcon
                  sx={{
                    width: "25px",
                    height: "25px",
                  }}
                />
                <Typography>
                  <Link href="mailto:dmowski.alex@gmail.com">dmowski.alex@gmail.com</Link>
                </Typography>
              </Stack>

              <Stack
                sx={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: "10px",
                }}
              >
                <InstagramIcon
                  sx={{
                    width: "25px",
                    height: "25px",
                  }}
                />
                <Typography>
                  <Link href="https://www.instagram.com/dmowskii/">dmowskii</Link>
                </Typography>
              </Stack>
            </Stack>
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
              Legal:
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
                  <Link href="mailto:dmowski.alex@gmail.com">Terms of Use</Link>
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
                  <Link href="https://www.instagram.com/dmowskii/">Privacy Policy</Link>
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </CustomModal>
    </Stack>
  );
}
