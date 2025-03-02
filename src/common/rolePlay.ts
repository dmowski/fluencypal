import { AiVoice } from "./ai";

export interface InputFromUserBeforeRolePlay {
  id: string;
  label: string;
  placeholder: string;
  type: "text-input" | "textarea";
  defaultValue: string;
  required: boolean;
}

export interface RolePlayInstruction {
  id: string;
  title: string;
  subTitle: string;
  instructionToAi: string;
  exampleOfFirstMessageFromAi: string;
  illustrationDescription: string;
  imageSrc?: string;
  voice: AiVoice;
  input: InputFromUserBeforeRolePlay[];
}
