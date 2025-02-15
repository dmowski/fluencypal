"use client";

import { useState } from "react";
import { useAuth } from "../Auth/useAuth";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Link,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import { Cookie, LogOutIcon, MessageCircleQuestion, ReceiptText, X } from "lucide-react";
import InstagramIcon from "@mui/icons-material/Instagram";
import MailIcon from "@mui/icons-material/Mail";

export function Header() {
  const auth = useAuth();
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [isShowHelpModal, setIsShowHelpModal] = useState(false);

  if (!auth.isAuthorized) {
    return <></>;
  }

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

        {auth.isAuthorized && (
          <IconButton
            onClick={(e) => {
              setMenuAnchor(e.currentTarget);
            }}
          >
            <Avatar alt={userName} src={userPhoto} />
          </IconButton>
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

      <Modal
        open={isShowHelpModal}
        onClose={() => {
          setIsShowHelpModal(false);
        }}
      >
        <Stack
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "600px",
            bgcolor: "background.paper",
            borderRadius: "16px",
            padding: "30px 40px 60px 40px",
            alignItems: "flex-start",
            gap: "30px",
          }}
        >
          <IconButton
            sx={{ position: "absolute", top: "10px", right: "10px" }}
            onClick={() => setIsShowHelpModal(false)}
          >
            <X />
          </IconButton>

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
        </Stack>
      </Modal>
    </Stack>
  );
}
