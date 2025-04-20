"use client";
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLocalStorage } from "react-use";
import { useTextAi } from "../Ai/useTextAi";
import { MODELS } from "@/common/ai";
import {
  AiRolePlayInstructionCreator,
  InputStructureForUser,
  RolePlayInputResult,
  RolePlayInputType,
  RolePlayInstruction,
} from "./types";
import { useSettings } from "../Settings/useSettings";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { RolePlayCardApp } from "./RolePlayCardApp";
import { GuessGameStat } from "../Conversation/types";
import { uniq } from "@/libs/uniq";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { supportedLanguages } from "@/common/lang";
import { getUrlStart } from "../Lang/getUrlStart";
import { useLingui } from "@lingui/react";
import { RolePlayScenariosInfo } from "./rolePlayData";
import { VenetianMask } from "lucide-react";

const firstLimit = 6;

const allCategoriesLabel = "All";

const getStartDefaultInstruction = (fullLanguageName: string) => {
  return `You are playing role-play conversation with user.
Use only ${fullLanguageName} language during conversation.`;
};

const createAdditionalInstructionFormUserInput = (
  scenario: RolePlayInstruction,
  rolePlayInputs: RolePlayInputResult[]
) => {
  const additionalInfo = rolePlayInputs
    ? rolePlayInputs
        .filter((userInput) => userInput.userValue)
        .map((userInput) => `${userInput.labelForAi}: ${userInput.userValue}`)
        .join("\n")
    : "";
  const additionalInstruction = `------
Role-play: ${scenario.title}

Your role:
${scenario.instructionToAi}

You can start with message like:
"${scenario.exampleOfFirstMessageFromAi}"

${
  additionalInfo
    ? `Additional info:
${additionalInfo}`
    : ""
}
`;
  return additionalInstruction;
};

const getDefaultInstruction: AiRolePlayInstructionCreator = (
  scenario,
  fullLanguageName,
  userInput
) => {
  const instruction = getStartDefaultInstruction(fullLanguageName);
  const additionalInfo = createAdditionalInstructionFormUserInput(scenario, userInput);
  return `${instruction}
${additionalInfo}`;
};

interface RolePlayBoardProps {
  rolePlayInfo: RolePlayScenariosInfo;
}
export const RolePlayBoard = ({ rolePlayInfo }: RolePlayBoardProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { i18n } = useLingui();
  const userInfo = useAiUserInfo();
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] as string;
  const supportedLang = supportedLanguages.find((l) => l === locale) || "en";

  const rolePlayId = searchParams.get("rolePlayId");
  const selectedTabUrl = searchParams.get("rolePlayTab") || allCategoriesLabel;

  const [selectedTab, setSelectedTab] = useState(selectedTabUrl);

  useEffect(() => {
    if (selectedTabUrl !== selectedTab) {
      setSelectedTab(selectedTabUrl);
    }
  }, [selectedTabUrl]);

  const onSetTab = (tab: string) => {
    setSelectedTab(tab);
    router.push(`${getUrlStart(supportedLang)}practice?rolePlayTab=${tab}`, { scroll: false });
  };

  const setRolePlayId = (id?: string) => {
    router.push(
      id
        ? `${getUrlStart(supportedLang)}practice?rolePlayId=${id}`
        : `${getUrlStart(supportedLang)}practice`,
      {
        scroll: false,
      }
    );
  };

  const closeRolePlay = () => {
    setRolePlayId();
    setSelectedRolePlayScenario(null);
  };

  const aiConversation = useAiConversation();
  const textAi = useTextAi();
  const settings = useSettings();

  const [isLimited, setIsLimited] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedRolePlayScenario, setSelectedRolePlayScenario] =
    useState<RolePlayInstruction | null>(null);

  const visibleScenarios =
    selectedTab === allCategoriesLabel
      ? rolePlayInfo.rolePlayScenarios.filter((_, index) => !isLimited || index < firstLimit)
      : rolePlayInfo.rolePlayScenarios.filter(
          (scenario) => scenario.category.categoryTitle === selectedTab
        );

  const allTabs = uniq([
    allCategoriesLabel,
    ...rolePlayInfo.rolePlayScenarios.map((scenario) => scenario.category.categoryTitle),
  ]);

  useEffect(() => {
    if (!rolePlayId) {
      setSelectedRolePlayScenario(null);
      return;
    }

    if (rolePlayId == selectedRolePlayScenario?.id) {
      return;
    }

    const scenario = rolePlayInfo.rolePlayScenarios.find((scenario) => scenario.id === rolePlayId);
    if (scenario) {
      setSelectedRolePlayScenario(scenario);
    }
  }, [rolePlayId]);

  const selectScenario = (scenario: RolePlayInstruction) => {
    setRolePlayId(scenario.id);
    setSelectedRolePlayScenario(scenario);
  };

  const [userInputs, setUserInputs] = useLocalStorage<Record<string, string>>(
    "rolePlayUserInputs",
    {}
  );

  const onStartRolePlay = (
    scenario: RolePlayInstruction,
    rolePlayInputs: RolePlayInputResult[],
    gameStat?: GuessGameStat
  ) => {
    const instruction = getDefaultInstruction(
      scenario,
      settings.fullLanguageName || "English",
      rolePlayInputs
    );
    aiConversation.startConversation({
      mode: "role-play",
      customInstruction: instruction,
      voice: scenario.voice,
      gameWords: gameStat,
      analyzeResultAiInstruction: scenario.analyzeResultAiInstruction,
    });
  };

  const processInputWithAi = async (
    aiSummarizingInstruction: string,
    value: string,
    lengthToTriggerSummary: number,
    requiredFields: string[],
    isNeedUserInfo: boolean,
    cacheAiSummary: boolean
  ) => {
    if (!aiSummarizingInstruction || value.length < lengthToTriggerSummary) {
      return value;
    }

    const userInfoString =
      isNeedUserInfo && userInfo.userInfo?.records.length
        ? "\n\nUser Info:" + userInfo.userInfo?.records.join(", ")
        : "";
    const systemMessage = aiSummarizingInstruction + requiredFields.join(", ") + userInfoString;

    console.log("systemMessage", systemMessage);
    const aiResult = await textAi.generate({
      systemMessage: systemMessage,
      userMessage: value,
      model: MODELS.gpt_4o,
      cache: cacheAiSummary,
      languageCode: settings.languageCode || "en",
    });
    return aiResult || value;
  };

  const modeProcessors: Record<
    RolePlayInputType,
    (
      input: InputStructureForUser,
      userValue: string,
      lengthToTriggerSummary: number,
      requiredFields: string[]
    ) => Promise<string>
  > = {
    textarea: async (input, userValue, lengthToTriggerSummary, requiredFields) => {
      return processInputWithAi(
        input.aiSummarizingInstruction || "",
        userValue,
        lengthToTriggerSummary,
        requiredFields,
        input.injectUserInfoToSummary || false,
        input.cacheAiSummary !== undefined ? input.cacheAiSummary : true
      );
    },
    "text-input": async (input, userValue, lengthToTriggerSummary, requiredFields) => {
      return processInputWithAi(
        input.aiSummarizingInstruction || "",
        userValue,
        lengthToTriggerSummary,
        requiredFields,
        input.injectUserInfoToSummary || false,
        input.cacheAiSummary !== undefined ? input.cacheAiSummary : true
      );
    },
    options: async (input, userValue, lengthToTriggerSummary, requiredFields) => {
      const aiOptions = input.optionsAiDescriptions || {};
      const value = aiOptions[userValue] || userValue;

      return processInputWithAi(
        input.aiSummarizingInstruction || "",
        value,
        lengthToTriggerSummary,
        requiredFields,
        input.injectUserInfoToSummary || false,
        input.cacheAiSummary !== undefined ? input.cacheAiSummary : true
      );
    },

    checkbox: async (input, userValue, lengthToTriggerSummary, requiredFields) => {
      if (userValue === "true") {
        return input.labelForAi;
      } else {
        return "";
      }
    },
  };

  const prepareUserInputs = async () => {
    if (!selectedRolePlayScenario) return [];

    const rolePlayInputs = await Promise.all(
      selectedRolePlayScenario.input.map(async (input) => {
        const inputId = selectedRolePlayScenario.id + "-" + input.id;
        const userValue = userInputs?.[inputId] || input.defaultValue || "";

        const requiredFieldsIdsToSummary = input.requiredFieldsToSummary || [];
        const requiredFields = requiredFieldsIdsToSummary.map((fieldId) => {
          const field = selectedRolePlayScenario.input.find((input) => input.id === fieldId);
          return `${field?.labelForAi || ""}: ${userInputs?.[selectedRolePlayScenario.id + "-" + fieldId]}`;
        });

        let processedUserValue = await modeProcessors[input.type](
          input,
          userValue,
          input.lengthToTriggerSummary || 400,
          requiredFields
        );

        if (processedUserValue) {
          const inputRecord: RolePlayInputResult = {
            labelForAi: input.labelForAi,
            userValue: processedUserValue,
          };
          return inputRecord;
        }
      })
    );

    return rolePlayInputs.filter((input) => input) as RolePlayInputResult[];
  };

  const generateRandomWord = async (userLevelInfo: string) => {
    const systemMessage = [
      `You need to generate words to play the game Alias. Be creative.`,
      `Some of them should be simple and some of them should be hard. Depends on user level`,
      `First 6 words, should be funny to guess, next 6 words should be relatively easy to guess, last 6 words should be hard to guess.`,

      `Return your words with comma separated.`,
      `Example of response format (lowercased words comma separated): apple, banana, orange`,
      `You are part for software. You need to response strictly follow formate of response, because it's part of another software. Don't add any wrapper words or phrases`,
    ].join(" ");

    const response = await textAi.generate({
      systemMessage,
      userMessage: `Generate 18 words. Use ${settings.fullLanguageName} language. User language level: ${userLevelInfo}`,
      model: "gpt-4o",
      languageCode: settings.languageCode || "en",
    });
    console.log("generateRandomWord:", response);
    const words = response.split(",");
    const shuffledWords = words.sort(() => Math.random() - 0.5);
    const wordsAiToDescribe: string[] = [];
    const wordsUserToDescribe: string[] = [];
    for (let i = 0; i < words.length; i++) {
      const isWordToGuess = i % 2 === 0;
      if (isWordToGuess) {
        wordsAiToDescribe.push(shuffledWords[i]);
      } else {
        wordsUserToDescribe.push(shuffledWords[i]);
      }
    }

    return { wordsUserToDescribe, wordsAiToDescribe };
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRolePlayScenario) return;
    setIsStarting(true);
    const rolePlayInputs = await prepareUserInputs();

    const isNeedToGenerateWords = selectedRolePlayScenario.gameMode === "alias";
    if (isNeedToGenerateWords) {
      const wordsInfo = await generateRandomWord(
        rolePlayInputs.map((input) => input.labelForAi + ":" + input.userValue).join(", ")
      );

      onStartRolePlay(selectedRolePlayScenario, rolePlayInputs, wordsInfo);
    } else {
      onStartRolePlay(selectedRolePlayScenario, rolePlayInputs);
    }
    setIsStarting(false);
  };

  return (
    <DashboardCard>
      <Stack gap={"10px"}>
        <Stack
          sx={{
            flexDirection: "row",
            alignItems: "center",
            gap: "15px",
            paddingBottom: "10px",
          }}
        >
          <Stack
            sx={{
              borderRadius: "50%",
              background: "linear-gradient(45deg,rgb(230, 69, 182) 0%,rgb(109, 111, 209) 100%)",
              height: "50px",
              width: "50px",

              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <VenetianMask size={"25px"} />
          </Stack>
          <Typography variant="h6">{i18n._(`Role Play`)}</Typography>
        </Stack>

        {selectedRolePlayScenario && (
          <CustomModal
            padding="0"
            isOpen={true}
            onClose={() => closeRolePlay()}
            width="min(100vw, 650px)"
          >
            <Stack
              sx={{
                width: "100%",
              }}
            >
              <Stack
                sx={{
                  width: "100%",
                  padding: "20px",
                  height: "min(260px, 40vh)",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  justifyContent: "flex-end",
                  position: "relative",
                  borderRadius: "16px 16px 0 0",
                  background:
                    "linear-gradient(180deg, rgba(12, 12, 14, 0) 0%,  rgba(12, 12, 14, 0.3) 100%)",
                }}
              >
                <Stack
                  sx={{
                    backgroundImage: `url(${selectedRolePlayScenario.imageSrc})`,
                    width: "100%",
                    height: "100%",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: -1,
                  }}
                ></Stack>
              </Stack>

              <Stack
                component={"form"}
                sx={{
                  padding: "35px",
                  gap: "30px",
                  boxSizing: "border-box",
                  alignItems: "flex-start",
                  "@media (max-width: 600px)": {
                    padding: "20px 20px",
                  },
                }}
                onSubmit={onSubmit}
              >
                <Stack>
                  <Typography
                    variant="h5"
                    component="h2"
                    sx={{
                      color: "#fff",
                      textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    {selectedRolePlayScenario.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#fff",
                      opacity: 0.7,
                      textShadow: "1px 1px 3px rgba(0, 0, 0, 0.7)",
                    }}
                  >
                    {selectedRolePlayScenario.subTitle}
                  </Typography>
                </Stack>

                {selectedRolePlayScenario.input.length > 0 && (
                  <Stack
                    sx={{
                      gap: "15px",
                      width: "100%",
                      maxWidth: "600px",
                    }}
                  >
                    {selectedRolePlayScenario.input.map((input, index) => {
                      const type = input.type;
                      const inputId = selectedRolePlayScenario.id + "-" + input.id;
                      const value = userInputs?.[inputId] || input.defaultValue || "";
                      const inputRenderMap: Record<RolePlayInputType, React.ReactElement> = {
                        "text-input": (
                          <TextField
                            key={index}
                            value={value}
                            onChange={(e) => {
                              setUserInputs({
                                ...userInputs,
                                [inputId]: e.target.value,
                              });
                            }}
                            required={input.required}
                            disabled={isStarting}
                            label={input.labelForUser}
                            placeholder={input.placeholder}
                            variant="outlined"
                          />
                        ),
                        checkbox: (
                          <FormControlLabel
                            key={index}
                            control={
                              <Checkbox
                                checked={value === "true"}
                                onChange={(e) => {
                                  setUserInputs({
                                    ...userInputs,
                                    [inputId]: e.target.checked ? "true" : "false",
                                  });
                                }}
                                disabled={isStarting}
                              />
                            }
                            required={input.required}
                            label={input.labelForUser}
                          />
                        ),
                        textarea: (
                          <TextField
                            key={index}
                            disabled={isStarting}
                            multiline
                            required={input.required}
                            value={value}
                            onChange={(e) => {
                              setUserInputs({
                                ...userInputs,
                                [inputId]: e.target.value,
                              });
                            }}
                            rows={4}
                            label={input.labelForUser}
                            placeholder={input.placeholder}
                            variant="outlined"
                          />
                        ),
                        options: (
                          <Stack
                            key={index}
                            sx={{
                              gap: "3px",
                              paddingBottom: "5px",
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                opacity: 0.7,
                              }}
                            >
                              {input.labelForUser}
                            </Typography>

                            <FormControl
                              sx={{
                                display: "none",
                                "@media (max-width: 600px)": {
                                  display: "flex",
                                },
                              }}
                            >
                              <RadioGroup
                                value={value}
                                onChange={(e) => {
                                  setUserInputs({
                                    ...userInputs,
                                    [inputId]: e.target.value,
                                  });
                                }}
                              >
                                {input.options?.map((option, optionIndex) => (
                                  <FormControlLabel
                                    key={optionIndex}
                                    value={option}
                                    control={<Radio />}
                                    label={option}
                                  />
                                ))}
                              </RadioGroup>
                            </FormControl>

                            <ButtonGroup
                              sx={{
                                "@media (max-width: 600px)": {
                                  display: "none",
                                },
                              }}
                            >
                              {input.options?.map((option, optionIndex) => (
                                <Button
                                  key={optionIndex}
                                  onClick={() => {
                                    setUserInputs({
                                      ...userInputs,
                                      [inputId]: option,
                                    });
                                  }}
                                  variant={value === option ? "contained" : "outlined"}
                                >
                                  {option}
                                </Button>
                              ))}
                            </ButtonGroup>
                          </Stack>
                        ),
                      };

                      return inputRenderMap[type];
                    })}
                  </Stack>
                )}

                <Button
                  sx={{
                    padding: "10px 30px",
                  }}
                  size="large"
                  variant="contained"
                  type="submit"
                  disabled={isStarting}
                >
                  {isStarting ? i18n._(`Loading...`) : i18n._(`Start`)}
                </Button>
              </Stack>
            </Stack>
          </CustomModal>
        )}

        <Stack gap={"20px"}>
          <Tabs
            scrollButtons="auto"
            variant="scrollable"
            value={selectedTab}
            onChange={(event, newId) => onSetTab(`${newId || allCategoriesLabel}`)}
            sx={{
              paddingLeft: "10px",
            }}
          >
            {allTabs.map((tab, index) => {
              return <Tab key={index} label={tab} value={tab} />;
            })}
          </Tabs>

          <Stack gap="15px">
            <Stack
              sx={{
                gap: "20px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",

                "@media (max-width: 850px)": {
                  gridTemplateColumns: "1fr",
                  gap: "30px",
                },
              }}
            >
              {visibleScenarios.map((scenario, index) => {
                return (
                  <RolePlayCardApp
                    key={index}
                    scenario={scenario}
                    onClick={() => selectScenario(scenario)}
                  />
                );
              })}
            </Stack>
            {selectedTab === allCategoriesLabel && (
              <Button
                startIcon={isLimited ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                onClick={() => setIsLimited(!isLimited)}
              >
                {isLimited ? i18n._(`Show more`) : i18n._(`Show less`)}
              </Button>
            )}
          </Stack>
        </Stack>
      </Stack>
    </DashboardCard>
  );
};
