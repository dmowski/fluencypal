"use client";

import { Button, Stack, Typography } from "@mui/material";
import { CustomModal } from "../uiKit/Modal/CustomModal";
import { useLingui } from "@lingui/react";
import { JSX, useState } from "react";

interface StepInfo {
  title: string;
  content: JSX.Element;
  button: JSX.Element;
}

interface GoalPreparingModalProps {
  onClose: () => void;
  onStart: () => void;
}

export const GoalPreparingModal = ({ onClose, onStart }: GoalPreparingModalProps) => {
  const { i18n } = useLingui();

  const [step, setStep] = useState(0);
  const onNext = () => {
    if (step < maxSteps - 1) {
      setStep(step + 1);
    } else {
      onStart();
    }
  };

  const steps: StepInfo[] = [
    {
      title: i18n._(`You are on the right track!`),
      content: (
        <Typography>
          We will get know each other. Your task is to provide information about you. Our task is to
          prepare a plan for you. Your plan will contain 8 uniq lessons design based on yours
          requirements. But we need something from you...
        </Typography>
      ),
      button: (
        <Button onClick={onNext} variant="outlined" color="info" size="large">
          {i18n._(`Okay`)}
        </Button>
      ),
    },

    {
      title: i18n._(`What we need from you?`),
      content: (
        <Typography>
          Just talk.. Your thoughts. Nothing more.. Try to share what to want to achieve from
          learning. This "Goal" conversation will last about 8 messages, during that time, try to
          share what you want. And will try our best
        </Typography>
      ),
      button: (
        <Button onClick={onNext} variant="outlined" color="info" size="large">
          {i18n._(`I agree`)}
        </Button>
      ),
    },

    {
      title: i18n._(`From founder`),
      content: (
        <Typography>
          My name is Alex. I am the creator of this app. This app is still in early development.
          So.. If you want share your feedback, I will be really happy to hear it. And I will share
          as many free hours as you need.
        </Typography>
      ),
      button: (
        <Button onClick={onNext} variant="outlined" color="info" size="large">
          {i18n._(`Got it`)}
        </Button>
      ),
    },

    {
      title: i18n._(`Almost ready...`),
      content: (
        <Typography>
          On the next screen, we will ask your permission to microphone, please press "Grant" to
          allow AI talk with you.
        </Typography>
      ),
      button: (
        <Button onClick={onNext} variant="outlined" color="info" size="large">
          {i18n._(`Let's do it`)}
        </Button>
      ),
    },

    {
      title: i18n._(`Finally`),
      content: (
        <Typography>
          Try to use target language, but you free speak in your native language. Ai will understand
          you. After recording you will see analysis on your messages. This feature allows you to
          constantly correct your speak. On "Goal" lesson, don't be shy to "send as is". We just in
          the beginning.
        </Typography>
      ),
      button: (
        <Button onClick={onNext} variant="contained" color="info" size="large">
          {i18n._(`Let's rock it!`)}
        </Button>
      ),
    },
  ];

  const maxSteps = steps.length;

  const currentStep = steps[step] || steps[0];

  return (
    <CustomModal isOpen={true} onClose={() => onClose()}>
      <Stack
        sx={{
          gap: "10px",
        }}
      >
        <Stack>
          <Typography variant="h5" component="h2">
            {currentStep.title}
          </Typography>
        </Stack>

        {currentStep.content}

        <Stack
          sx={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "10px",
          }}
        >
          <Stack
            sx={{
              flexDirection: "row",
              alignItems: "center",
              gap: "15px",
            }}
          >
            {currentStep.button}
            <Typography
              variant="caption"
              sx={{
                color: "#b6d5f3",
                opacity: 0.9,
              }}
            >
              {step + 1} / {maxSteps}
            </Typography>
          </Stack>
          <Button onClick={onClose}>{i18n._(`Close`)}</Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
