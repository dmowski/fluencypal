import { Button, Link, Stack, Typography } from "@mui/material";
import { useAuth } from "../Auth/useAuth";
import { CustomModal } from "../Modal/CustomModal";
import InstagramIcon from "@mui/icons-material/Instagram";
import MailIcon from "@mui/icons-material/Mail";
import { Cookie, ReceiptText, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import { firestore } from "../Firebase/init";
import {
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  Firestore,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { UserSettings } from "@/common/user";
import { useNotifications } from "@toolpad/core/useNotifications";

interface NeedHelpModalProps {
  onClose: () => void;
}

async function deleteCollectionDocs(firestore: Firestore, collectionPath: string): Promise<void> {
  const snap = await getDocs(collection(firestore, collectionPath));
  const deletions = snap.docs.map((docSnap) => deleteDoc(docSnap.ref));
  await Promise.all(deletions);
}

export const NeedHelpModal = ({ onClose }: NeedHelpModalProps) => {
  const auth = useAuth();
  const userId = auth.uid;
  const notifications = useNotifications();
  const userSettingsDoc = useMemo(() => {
    return userId ? (doc(firestore, `users/${userId}`) as DocumentReference<UserSettings>) : null;
  }, [userId]);

  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const onDeleteAccount = async () => {
    if (!userId || !userSettingsDoc) return;
    const confirm = window.confirm("Are you sure you want to delete your account?");
    if (!confirm) return;

    setIsDeletingAccount(true);

    try {
      await deleteCollectionDocs(firestore, `users/${userId}/conversations`);
      await deleteCollectionDocs(firestore, `users/${userId}/homeworks`);
      await deleteCollectionDocs(firestore, `users/${userId}/usageLogs`);

      await setDoc(userSettingsDoc, { language: null }, { merge: true });
      notifications.show(
        "Your account has been successfully deleted. We are sorry to see you go!",
        {
          severity: "success",
          autoHideDuration: 10_000,
        }
      );

      auth.logout();
      onClose();
    } catch (error) {
      notifications.show(
        "Failed to delete your account. Please try again later, or contact the developers.",
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
    <CustomModal isOpen={true} onClose={() => onClose()}>
      <Typography variant="h4" component="h2">
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
                <Link href="/terms">Terms of Use</Link>
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
                <Link href="/privacy">Privacy Policy</Link>
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <Stack
        sx={{
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Button onClick={onClose} variant="outlined" color="primary">
          Close
        </Button>
        <Button
          disabled={isDeletingAccount}
          onClick={onDeleteAccount}
          color="error"
          startIcon={<Trash size={"18px"} />}
        >
          {isDeletingAccount ? "Deleting..." : "Delete account"}
        </Button>
      </Stack>
    </CustomModal>
  );
};
