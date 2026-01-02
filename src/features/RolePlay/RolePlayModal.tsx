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
  TextField,
  Typography,
} from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";

import { RolePlayInputType } from "./types";

import { useRolePlay } from "./useRolePlay";
import { useLingui } from "@lingui/react";
import { useUsage } from "../Usage/useUsage";
import { TrialEndedSection } from "../Usage/TrialEndedSection";

export const RolePlayModal = () => {
  const {
    selectedRolePlayScenario,
    closeRolePlay,
    onSubmit,
    userInputs,
    setUserInputs,
    isStarting,
  } = useRolePlay();

  const usage = useUsage();

  const { i18n } = useLingui();

  return (
    <>
      {selectedRolePlayScenario && (
        <CustomModal isOpen={true} onClose={() => closeRolePlay()}>
          <Stack
            sx={{
              width: "100%",
              maxWidth: "600px",
            }}
          >
            <Stack
              sx={{
                width: "100%",
                height: "400px",
                boxSizing: "border-box",
              }}
            >
              <Stack
                sx={{
                  backgroundImage: `url(${selectedRolePlayScenario.imageSrc})`,
                  width: "100%",
                  height: `100%`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {selectedRolePlayScenario.videoSrc && (
                  <video
                    src={selectedRolePlayScenario.videoSrc}
                    loop
                    autoPlay
                    controls={false}
                    muted={true}
                    playsInline
                    style={{
                      width: "100%",
                      backgroundColor: "rgb(10, 18, 30)",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </Stack>
            </Stack>

            <Stack
              component={"form"}
              sx={{
                padding: "35px 0",
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
    </>
  );
};
