import {
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { ChevronDown, Flag, LandPlot, Plus, Sparkle } from "lucide-react";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useLingui } from "@lingui/react";
import { useWords } from "../Words/useWords";
import { useRules } from "../Rules/useRules";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { usePlan } from "../Plan/usePlan";
import { GoalPlan, PlanElement, PlanElementMode } from "../Plan/types";
import { PlanCard } from "../Plan/PlanCard";

import { cardColors, modeCardProps } from "../Plan/data";
import { SupportedLanguage } from "@/features/Lang/lang";
import { useMemo, useState } from "react";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { getUrlStart } from "../Lang/getUrlStart";
import { useUrlParam } from "../Url/useUrlParam";
import { useSettings } from "../Settings/useSettings";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { ConversationMode } from "@/common/user";

export const PlanDashboardCards = ({ lang }: { lang: SupportedLanguage }) => {
  const aiConversation = useAiConversation();
  const words = useWords();
  const rules = useRules();
  const { i18n } = useLingui();
  const userInfo = useAiUserInfo();
  const plan = usePlan();
  const settings = useSettings();

  const [selectGoalModalAnchorEl, setSelectGoalModalAnchorEl] = useState<null | HTMLElement>(null);

  const startGoalElement = async (
    element: PlanElement,
    options: {
      conversationMode: ConversationMode;
      webCamDescription?: string;
    }
  ) => {
    if (!plan.activeGoal) return;

    if (settings.conversationMode !== options.conversationMode) {
      await settings.setConversationMode(options.conversationMode);
    }

    const goalInfo = {
      goalElement: element,
      goalPlan: plan.activeGoal,
    };

    if (element.mode === "words") {
      words.getNewWordsToLearn(goalInfo);
      return;
    }

    if (element.mode === "rule") {
      rules.getRules(goalInfo);
      return;
    }
    aiConversation.startConversation({
      mode: element.mode === "play" ? "goal-role-play" : "goal-talk",
      goal: goalInfo,
      webCamDescription: options.webCamDescription,
      conversationMode: options.conversationMode,
    });
  };

  const isGoalSet = !!plan.activeGoal?.elements?.length;

  const deletePlans = async () => {
    const confirmResult = confirm(
      i18n._(`Are you sure you want to delete your goal? This action cannot be undone.`)
    );
    if (!confirmResult) {
      return;
    }

    plan.deleteGoals();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const modeLabels: Record<PlanElementMode, string> = {
    conversation: i18n._(`Conversation`),
    play: i18n._(`Role Play`),
    words: i18n._(`Words`),
    rule: i18n._(`Rule`),
  };

  const goalDescription = plan.activeGoal?.goalQuiz?.description || "";

  const sortedElements = useMemo(() => {
    const elements = plan.activeGoal?.elements || [];
    const conversationElement = elements.find((el) => el.mode === "conversation");
    if (!conversationElement) {
      return elements;
    }

    const otherElements = elements.filter((el) => el !== conversationElement);
    return [conversationElement, ...otherElements];
  }, [plan.activeGoal?.elements]);

  let activeIndex: null | number = null;

  sortedElements.forEach((element, index) => {
    if (element.startCount == 0 && activeIndex === null) {
      activeIndex = index;
    }
  });
  const [isShowMoreModal, setIsShowMoreModal] = useUrlParam("showMoreModal");

  const doneLessonsCount = sortedElements.reduce((acc, element) => {
    if (element.startCount > 0) {
      return acc + 1;
    }
    return acc;
  }, 0);

  const [isLearningPlanUpdating, setIsLearningPlanUpdating] = useState(false);

  const generateMoreLessons = async () => {
    if (!plan.activeGoal) {
      return;
    }

    try {
      setIsLearningPlanUpdating(true);

      const goalPlanElements = plan.activeGoal?.elements || [];
      const goalPlanElementsString = goalPlanElements
        .map((element) => {
          return `${element.mode} - ${element.title}: ${element.description}`;
        })
        .join(", ");

      const newGoal = await plan.generateGoal({
        userInfo: userInfo.userInfo?.records || [],
        conversationMessages: [
          {
            isBot: true,
            id: "1",
            text: "What you learned already?",
          },
          {
            isBot: false,
            id: "2",
            text:
              "I learned following lessons and I want something new, but related to my goal. My learned lessons are: " +
              goalPlanElementsString,
          },
        ],
        languageCode: lang,
        goalQuiz: plan.activeGoal?.goalQuiz || undefined,
      });

      // filter new elements to copy only new elements
      const newElements = newGoal.elements.filter((newElement) => {
        return !goalPlanElements.some((oldElement) => oldElement.title === newElement.title);
      });

      const updatedPlan: GoalPlan = { ...plan.activeGoal };
      updatedPlan.elements = [...goalPlanElements, ...newElements];
      await plan.addGoalPlan(updatedPlan);

      setIsLearningPlanUpdating(false);
      setIsShowMoreModal(false);
    } catch (error) {
      alert(i18n._(`Something went wrong while generating more lessons. Please try again later.`));
      setIsLearningPlanUpdating(false);

      throw error;
    }
  };

  const minimumLessonsCountToExpand = 3;
  const isAbleToExpand = doneLessonsCount >= minimumLessonsCountToExpand;

  const languageGoals = plan.goals
    .filter((goal) => goal.languageCode === settings.languageCode)
    .sort((a, b) => b.createdAt - a.createdAt);

  return (
    <Stack gap="20px">
      <Stack
        sx={{
          display: "grid",
          alignItems: "center",
          gridTemplateColumns: "1fr",
          gap: "5px",
          paddingTop: "40px",
        }}
      >
        <Stack
          sx={{
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <Stack
            sx={{
              borderRadius: "50%",
              background: "linear-gradient(45deg,rgb(120, 13, 220) 0%,rgb(199, 13, 236) 100%)",
              height: "60px",
              width: "60px",

              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Flag size={"27px"} />
          </Stack>
          <Stack>
            <Typography
              variant="caption"
              align="center"
              sx={{
                opacity: 0.7,
                textTransform: "uppercase",
              }}
            >
              {i18n._(`Learning Plan`)}
            </Typography>
            <Stack
              sx={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              {languageGoals.length > 1 && (
                <IconButton
                  size="small"
                  sx={{
                    visibility: "hidden",
                  }}
                >
                  <ChevronDown />
                </IconButton>
              )}

              <Typography variant="h6" align="center">
                {isGoalSet
                  ? plan.activeGoal?.title || i18n._(`Goal`)
                  : i18n._(`Start your way to fluency`)}
              </Typography>
              {languageGoals.length > 1 && (
                <IconButton
                  size="small"
                  onClick={(event) => setSelectGoalModalAnchorEl(event.currentTarget)}
                >
                  <ChevronDown />
                </IconButton>
              )}

              {selectGoalModalAnchorEl && (
                <Menu
                  sx={{
                    marginBottom: "130px",
                  }}
                  anchorEl={selectGoalModalAnchorEl}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  keepMounted
                  open={Boolean(selectGoalModalAnchorEl)}
                  onClose={() => setSelectGoalModalAnchorEl(null)}
                >
                  {languageGoals.map((goal) => {
                    const isActive = plan.activeGoal?.id === goal.id;
                    return (
                      <MenuItem
                        key={goal.id}
                        sx={{}}
                        disabled={isActive}
                        onClick={() => {
                          setSelectGoalModalAnchorEl(null);
                          plan.setActiveGoal(goal.id);
                        }}
                      >
                        <ListItemIcon>
                          {isActive ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                        </ListItemIcon>
                        <ListItemText>
                          <Typography>{goal.title}</Typography>
                        </ListItemText>
                      </MenuItem>
                    );
                  })}

                  <Divider />

                  <MenuItem
                    onClick={() => {
                      window.location.href = `${getUrlStart(lang)}quiz?learn=${settings.languageCode || "en"}`;
                    }}
                  >
                    <ListItemIcon>
                      <Plus />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography> {i18n._(`Add new goal`)}</Typography>
                    </ListItemText>
                  </MenuItem>
                </Menu>
              )}
            </Stack>
          </Stack>
        </Stack>

        <Stack
          sx={{
            flexDirection: "row",
            gap: "5px",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <Stack
            sx={{
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              justifyContent: "center",
            }}
          >
            {goalDescription && (
              <Typography
                align="center"
                sx={{
                  opacity: 0.8,
                }}
                variant="caption"
              >
                {goalDescription}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Stack>
      {isGoalSet && plan.activeGoal ? (
        <Stack
          sx={{
            gap: "20px",
            width: "100%",
          }}
        >
          {sortedElements.map((planElement, index, all) => {
            const cardInfo = modeCardProps[planElement.mode];
            const colorIndex = index % cardColors.length;
            const cardColor = cardColors[colorIndex];
            const elementsWithSameMode =
              sortedElements.filter((element) => element.mode === planElement.mode) || [];
            const currentElementIndex = elementsWithSameMode.findIndex(
              (element) => element.id === planElement.id
            );

            const imageVariants = cardInfo.imgUrl;
            const imageIndex = currentElementIndex % imageVariants.length;
            const imageUrl = imageVariants[imageIndex];
            const isDone = planElement.startCount > 0;
            const isActive = index === activeIndex;

            return (
              <PlanCard
                id={planElement.id}
                key={planElement.id}
                delayToShow={index * 80}
                title={planElement.title}
                subTitle={modeLabels[planElement.mode]}
                description={planElement.description}
                details={planElement.details}
                isDone={isDone}
                isActive={isActive}
                isContinueLabel={isActive && index > 0}
                onClick={(options) => startGoalElement(planElement, options)}
                startColor={cardColor.startColor}
                progressPercent={Math.min((planElement.startCount || 0) * 10, 100)}
                endColor={cardColor.endColor}
                bgColor={cardColor.bgColor}
                isLast={index === all.length - 1}
                icon={
                  <Stack>
                    <Stack className="avatar">
                      <img src={imageUrl} alt="" />
                    </Stack>
                  </Stack>
                }
                actionLabel={i18n._(`Start`)}
              />
            );
          })}
          <Stack
            sx={{
              alignItems: "center",
              maxWidth: "700px",
              paddingTop: "10px",
            }}
          >
            <Button
              startIcon={<Sparkle size={"14px"} />}
              variant="outlined"
              onClick={() => setIsShowMoreModal(true)}
            >
              {i18n._(`Show more lessons`)}
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack sx={{}}>
          <Button
            startIcon={<LandPlot />}
            href={`${getUrlStart(lang)}quiz?learn=${settings.languageCode || "en"}`}
            sx={{
              padding: "20px",
            }}
            variant="contained"
          >
            Create a plan
          </Button>
        </Stack>
      )}

      {isShowMoreModal && (
        <CustomModal isOpen={true} onClose={() => setIsShowMoreModal(false)}>
          <Stack
            sx={{
              gap: "10px",
              alignItems: "center",
              width: "100%",
              maxWidth: "600px",
            }}
          >
            <Stack>
              <Typography
                align="center"
                variant="caption"
                sx={{
                  color: `rgba(255, 255, 255, 0.5)`,
                }}
              >
                {i18n._(`More unique lessons`)}
              </Typography>

              <Typography variant="h4" align="center" component="h2" className="decor-text">
                {plan.activeGoal?.title || i18n._(`Goal`)}
              </Typography>
              <Typography sx={{ paddingTop: "20px" }} align="center" variant="caption">
                {plan.activeGoal?.goalQuiz?.description ||
                  i18n._(`We will help you to learn the language you need`)}
              </Typography>
            </Stack>

            <Stack
              sx={{
                gap: "2px",
              }}
            >
              <Button
                sx={{
                  width: "100%",
                  marginTop: "20px",
                  padding: "10px 20px",
                }}
                onClick={() => {
                  deletePlans();
                  setIsShowMoreModal(false);
                }}
                variant="text"
                color="error"
                size="large"
                disabled={isLearningPlanUpdating}
              >
                {i18n._(`Delete current goal`)}
              </Button>

              <Button
                sx={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "10px 20px",
                }}
                onClick={generateMoreLessons}
                disabled={!isAbleToExpand || isLearningPlanUpdating}
                variant="contained"
                color="info"
                size="large"
              >
                {isLearningPlanUpdating
                  ? i18n._(`Generating...`)
                  : i18n._(`Generate more unique lessons`)}
              </Button>
              {!isAbleToExpand && (
                <Typography
                  align="center"
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._(
                    `In order to generate more lessons, you need to complete at least 3 lessons`
                  )}
                </Typography>
              )}
            </Stack>
          </Stack>
        </CustomModal>
      )}
    </Stack>
  );
};
