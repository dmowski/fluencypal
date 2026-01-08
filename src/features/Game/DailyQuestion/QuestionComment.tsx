import { Button, IconButton, Stack, Typography } from "@mui/material";
import { useLingui } from "@lingui/react";
import { useMemo } from "react";
import dayjs from "dayjs";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/features/Auth/useAuth";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/features/Firebase/firebaseDb";
import { DailyQuestionAnswer, DailyQuestionLike, LikeType } from "./types";
import { useGame } from "../useGame";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import { Avatar } from "../Avatar";

export const QuestionComment = ({
  answerDocId,
  answer,
  togglePublish,
}: {
  answerDocId: string;
  answer: DailyQuestionAnswer;
  togglePublish: () => void;
}) => {
  const auth = useAuth();
  const game = useGame();
  const { i18n } = useLingui();
  const isMyAnswer = answer.authorUserId === auth.uid;
  const likesCollectionRef = db.collections.dailyQuestionsAnswersLikes(
    auth.uid || undefined,
    answerDocId
  );
  const [likesSnapshot, loadingLikes, errorLikes] = useCollection(likesCollectionRef);

  const myLike = useMemo(() => {
    if (!likesSnapshot || !auth.uid) return null;
    return likesSnapshot.docs.find((doc) => doc.data().likeUserId === auth.uid) || null;
  }, [likesSnapshot, auth.uid]);

  const likeCount = useMemo(() => {
    if (!likesSnapshot) return 0;
    return likesSnapshot.docs.length;
  }, [likesSnapshot]);

  const removeMyLike = async () => {
    if (!auth.uid) return;
    if (myLike) {
      deleteDoc(myLike.ref);
    }
  };

  const addMyLike = async (likeType: LikeType) => {
    if (!auth.uid || !likesCollectionRef) return;
    if (myLike) {
      await removeMyLike();
    }

    const likeData: DailyQuestionLike = {
      answerId: answerDocId,
      likeUserId: auth.uid,
      likeType,
      createdAtIso: new Date().toISOString(),
    };

    await setDoc(doc(likesCollectionRef), likeData);
  };

  return (
    <Stack
      sx={{
        gap: "10px",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        padding: "18px 18px",
        borderRadius: "8px",
      }}
    >
      <Stack
        sx={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Stack sx={{}}>
            <Avatar
              url={game.gameAvatars?.[answer.authorUserId]}
              avatarSize="40px"
              onClick={() => {
                game.showUserInModal(answer.authorUserId);
              }}
            />
          </Stack>
          <Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {game.userNames?.[answer.authorUserId] || "Unknown User"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dayjs(answer.updatedAtIso).fromNow()}
            </Typography>
          </Stack>
        </Stack>

        {isMyAnswer ? (
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Typography variant="caption">{i18n._("This is your answer")}</Typography>
            <Stack
              sx={{
                backgroundColor: answer.isPublished ? "#4caf50" : "rgba(255, 255, 255, 0.2)",
                padding: "2px 10px",
                borderRadius: "6px",
                flexDirection: "row",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {answer.isPublished ? <Eye size={"12px"} /> : <EyeOff size={"12px"} />}
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                }}
              >
                {answer.isPublished ? i18n._("published") : i18n._("not published")}{" "}
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: likeCount === 0 ? 0.5 : 0.7,
              }}
            >
              {likeCount}
            </Typography>
            <IconButton
              size="small"
              onClick={() => {
                if (myLike) {
                  removeMyLike();
                } else {
                  addMyLike("like");
                }
              }}
            >
              {myLike ? (
                <FavoriteIcon color="error" fontSize="small" />
              ) : (
                <FavoriteBorderOutlinedIcon style={{ opacity: 0.5 }} fontSize="small" />
              )}
            </IconButton>
          </Stack>
        )}
      </Stack>
      <Typography variant="body2">{answer.transcript}</Typography>
      <Stack
        sx={{
          flexDirection: "row",
        }}
      >
        {isMyAnswer ? (
          <>
            <Button
              startIcon={answer.isPublished ? <EyeOff size={"15px"} /> : <Eye size={"15px"} />}
              onClick={() => {
                togglePublish();
              }}
              variant={answer.isPublished ? "outlined" : "contained"}
            >
              {answer.isPublished ? i18n._("Unpublish") : i18n._("Publish an answer")}
            </Button>
          </>
        ) : (
          <></>
        )}
      </Stack>
    </Stack>
  );
};
