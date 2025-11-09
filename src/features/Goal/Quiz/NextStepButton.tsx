"use client";

import { useLingui } from "@lingui/react";
import { ArrowRight } from "lucide-react";
import { useQuiz } from "./useQuiz";
import { FooterButton } from "../../Survey/FooterButton";

export const NextStepButton = ({
  disabled,
  actionButtonTitle,
}: {
  disabled?: boolean;
  actionButtonTitle?: string;
}) => {
  const { i18n } = useLingui();
  const { isStepLoading, nextStep } = useQuiz();

  return (
    <FooterButton
      disabled={disabled}
      onClick={() => {
        !isStepLoading && nextStep();
      }}
      title={actionButtonTitle || i18n._("Next")}
      endIcon={<ArrowRight />}
    />
  );
};
