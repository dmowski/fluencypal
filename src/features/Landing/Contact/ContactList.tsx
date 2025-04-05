import { Link, Stack, Typography } from "@mui/material";
import InstagramIcon from "@mui/icons-material/Instagram";
import MailIcon from "@mui/icons-material/Mail";
import TelegramIcon from "@mui/icons-material/Telegram";

export const ContactList = () => {
  return (
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
          <Link href="https://www.instagram.com/dmowskii/" target="_blank">
            dmowskii
          </Link>
        </Typography>
      </Stack>
    </Stack>
  );
};
