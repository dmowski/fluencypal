import { Button, ButtonGroup, FormLabel, Stack, TextField, Typography } from "@mui/material";
import { DashboardCard } from "../uiKit/Card/DashboardCard";
import { useAiConversation } from "../Conversation/useAiConversation";
import rolePlayScenarios from "./rolePlayData";
import { useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLocalStorage } from "react-use";
import { useTextAi } from "../Ai/useTextAi";
import { MODELS } from "@/common/ai";
import {
  InputStructureForUser,
  RolePlayInputResult,
  RolePlayInputType,
  RolePlayInstruction,
} from "./types";
import { useSettings } from "../Settings/useSettings";

const firstLimit = 6;
const hardHeight = "300px";

export const RolePlayCardsBlock = () => {
  const aiConversation = useAiConversation();
  const textAi = useTextAi();
  const settings = useSettings();

  const [isLimited, setIsLimited] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedRolePlayScenario, setSelectedRolePlayScenario] =
    useState<RolePlayInstruction | null>(null);

  const selectScenario = (scenario: RolePlayInstruction) => {
    setSelectedRolePlayScenario(scenario);
  };

  const [userInputs, setUserInputs] = useLocalStorage<Record<string, string>>(
    "rolePlayUserInputs",
    {}
  );

  const onStartRolePlay = (
    scenario: RolePlayInstruction,
    rolePlayInputs: RolePlayInputResult[]
  ) => {
    const instruction = scenario.instructionCreator(
      scenario,
      settings.fullLanguageName || "English",
      rolePlayInputs
    );
    aiConversation.startConversation({
      mode: "custom",
      customInstruction: instruction,
      voice: scenario.voice,
    });
  };

  const modeProcessors: Record<
    RolePlayInputType,
    (input: InputStructureForUser, userValue: string) => Promise<string>
  > = {
    textarea: async (input, userValue) => {
      if (!input.aiSummarizingInstruction || userValue.length < 1000) {
        return userValue;
      }
      const aiResult = await textAi.generate({
        systemMessage: input.aiSummarizingInstruction,
        userMessage: userValue,
        model: MODELS.gpt_4o,
      });
      return aiResult || userValue;
    },
    "text-input": async (input, userValue) => {
      return userValue;
    },
    options: async (input, userValue) => {
      const aiOptions = input.optionsAiDescriptions || {};
      return aiOptions[userValue] || userValue;
    },
  };

  const prepareUserInputs = async () => {
    if (!selectedRolePlayScenario) return [];

    const rolePlayInputs = await Promise.all(
      selectedRolePlayScenario.input.map(async (input) => {
        const inputId = selectedRolePlayScenario.id + "-" + input.id;
        const userValue = userInputs?.[inputId] || "";
        let processedUserValue = await modeProcessors[input.type](input, userValue);

        const inputRecord: RolePlayInputResult = {
          labelForAi: input.labelForAi,
          userValue: processedUserValue,
        };
        return inputRecord;
      })
    );

    return rolePlayInputs;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRolePlayScenario) return;
    setIsStarting(true);
    const rolePlayInputs = await prepareUserInputs();
    setIsStarting(false);

    onStartRolePlay(selectedRolePlayScenario, rolePlayInputs);
  };

  return (
    <DashboardCard>
      <Stack>
        <Typography variant="h2" className="decor-title">
          Role Play
        </Typography>
        <Typography
          variant="caption"
          sx={{
            opacity: 0.7,
          }}
        >
          Play a role and talk to the AI
        </Typography>
      </Stack>
      {selectedRolePlayScenario && (
        <CustomModal
          padding="0"
          isOpen={true}
          onClose={() => setSelectedRolePlayScenario(null)}
          width="min(90vw, 650px)"
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
                height: "min(320px, 40vh)",
                boxSizing: "border-box",
                overflow: "hidden",
                justifyContent: "flex-end",
                position: "relative",
                borderRadius: "16px 16px 0 0",
                background:
                  "linear-gradient(180deg, rgba(12, 12, 14, 0) 0%,  rgba(12, 12, 14, 0.3) 100%)",
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  color: "#fff",
                  textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
                  textTransform: "uppercase",
                  fontWeight: "900",
                }}
              >
                {selectedRolePlayScenario.title}
              </Typography>
              <Typography
                sx={{
                  color: "#fff",
                  textShadow: "1px 1px 3px rgba(0, 0, 0, 0.7)",
                }}
              >
                {selectedRolePlayScenario.subTitle}
              </Typography>

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
                padding: "25px 20px 20px 20px",
                gap: "20px",
                alignItems: "flex-start",
              }}
              onSubmit={onSubmit}
            >
              {selectedRolePlayScenario.input.length > 0 && (
                <Stack
                  sx={{
                    gap: "15px",
                    width: "100%",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#fff",
                      textShadow: "1px 1px 3px rgba(0, 0, 0, 0.7)",
                    }}
                  >
                    Before you start, please fill some information to make it more realistic.
                  </Typography>

                  <Stack
                    sx={{
                      gap: "20px",
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
                            <ButtonGroup>
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
                {isStarting ? "Loading..." : "Start"}
              </Button>
            </Stack>
          </Stack>
        </CustomModal>
      )}

      <Stack gap={"10px"}>
        <Stack
          sx={{
            gap: "10px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            "@media (max-width: 1100px)": {
              gridTemplateColumns: "1fr 1fr",
            },
            "@media (max-width: 850px)": {
              gridTemplateColumns: "1fr",
              gap: "15px",
            },
          }}
        >
          {rolePlayScenarios
            .filter((_, index) => !isLimited || index < firstLimit)
            .map((scenario, index) => {
              return (
                <Stack
                  key={index}
                  sx={{
                    position: "relative",
                    backgroundColor: "#222",
                    border: "none",
                    alignItems: "flex-start",
                    minHeight: hardHeight,

                    cursor: "pointer",
                    borderRadius: "5px",
                    overflow: "hidden",
                    textAlign: "left",
                    padding: "0px",
                    boxSizing: "border-box",
                    color: "#fff",
                    ":hover": {
                      ".role-play-image": {
                        opacity: 0.8,
                      },
                    },
                  }}
                  component={"button"}
                  onClick={() => selectScenario(scenario)}
                >
                  <Stack
                    sx={{
                      gap: "16px",
                      height: "100%",
                      alignItems: "flex-start",
                      justifyContent: "flex-end",
                      width: "100%",
                      position: "relative",
                      zIndex: 1,
                      boxSizing: "border-box",
                    }}
                  >
                    <Stack
                      sx={{
                        padding: "20px",
                        boxSizing: "border-box",
                        width: "100%",
                        paddingTop: "30px",
                        background:
                          "linear-gradient(180deg, rgba(12, 12, 14, 0) 0%,  rgba(12, 12, 14, 0.3) 100%)",
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: "990",
                          textShadow: "1px 1px 3px rgba(0, 0, 0, 0.2)",
                          textTransform: "uppercase",
                        }}
                      >
                        {scenario.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          opacity: 0.9,
                          textShadow: "1px 1px 4px rgba(0, 0, 0, 0.6)",
                        }}
                      >
                        {scenario.subTitle}
                      </Typography>
                    </Stack>
                  </Stack>
                  <Stack
                    className="role-play-image"
                    sx={{
                      backgroundImage: `url(${scenario.imageSrc})`,
                      width: "100%",
                      height: "100%",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      //borderRadius: "10px",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 0,
                    }}
                  ></Stack>
                </Stack>
              );
            })}
        </Stack>
        <Button
          startIcon={isLimited ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
          onClick={() => setIsLimited(!isLimited)}
        >
          {isLimited ? "Show more" : "Show less"}
        </Button>
      </Stack>
    </DashboardCard>
  );
};
