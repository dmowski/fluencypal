"use client";

import {
  createContext,
  useContext,
  ReactNode,
  JSX,
  useState,
  useEffect,
} from "react";
import {
  AiRolePlayInstructionCreator,
  InputStructureForUser,
  RolePlayInputResult,
  RolePlayInputType,
  RolePlayInstruction,
} from "./types";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { supportedLanguages } from "../Lang/lang";
import { getUrlStart } from "../Lang/getUrlStart";
import { useAiConversation } from "../Conversation/useAiConversation";
import { useTextAi } from "../Ai/useTextAi";
import { useSettings } from "../Settings/useSettings";
import { RolePlayScenariosInfo } from "./rolePlayData";
import { useLocalStorage } from "react-use";
import { GuessGameStat } from "../Conversation/types";
import { MODELS } from "@/common/ai";
import { uniq } from "@/libs/uniq";
import { ConversationMode } from "@/common/user";
import { useConversationAudio } from "../Audio/useConversationAudio";

const firstLimit = 6;

const allCategoriesLabel = "All";

const getStartDefaultInstruction = (fullLanguageName: string) => {
  return `You are playing role-play conversation with user.
Use only ${fullLanguageName} language during conversation.`;
};

const createAdditionalInstructionFormUserInput = (
  scenario: RolePlayInstruction,
  rolePlayInputs: RolePlayInputResult[],
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
  userInput,
) => {
  const instruction = getStartDefaultInstruction(fullLanguageName);
  const additionalInfo = createAdditionalInstructionFormUserInput(
    scenario,
    userInput,
  );
  return `${instruction}
${additionalInfo}`;
};

interface RolePlayContextType {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  closeRolePlay: () => void;
  selectedRolePlayScenario: RolePlayInstruction | null;
  userInputs: Record<string, string> | undefined;
  setUserInputs: React.Dispatch<
    React.SetStateAction<Record<string, string> | undefined>
  >;
  isStarting: boolean;
  selectedTab: string;
  onSetTab: (tab: string) => void;
  allCategoriesLabel: string;
  allTabs: string[];
  visibleScenarios: RolePlayInstruction[];
  selectScenario: (scenario: RolePlayInstruction) => void;

  isLimited: boolean;
  setIsLimited: React.Dispatch<React.SetStateAction<boolean>>;
}

const RolePlayContext = createContext<RolePlayContextType | null>(null);

function useProvideRolePlay({
  rolePlayInfo,
}: {
  rolePlayInfo: RolePlayScenariosInfo;
}): RolePlayContextType {
  const searchParams = useSearchParams();
  const router = useRouter();

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
    const newSearchParam = new URLSearchParams(window.location.search);
    newSearchParam.set("rolePlayTab", tab);
    router.push(
      `${getUrlStart(supportedLang)}practice?${newSearchParam.toString()}`,
      {
        scroll: false,
      },
    );
  };

  const setRolePlayId = (id?: string) => {
    if (id) {
      const newSearchParam = new URLSearchParams(window.location.search);
      newSearchParam.set("rolePlayId", id);
      router.push(
        `${getUrlStart(supportedLang)}practice?${newSearchParam.toString()}`,
        {
          scroll: false,
        },
      );
    } else {
      const newSearchParam = new URLSearchParams(window.location.search);
      newSearchParam.delete("rolePlayId");
      router.push(
        `${getUrlStart(supportedLang)}practice?${newSearchParam.toString()}`,
        {
          scroll: false,
        },
      );
    }
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
      ? rolePlayInfo.rolePlayScenarios.filter(
          (_, index) => !isLimited || index < firstLimit,
        )
      : rolePlayInfo.rolePlayScenarios.filter(
          (scenario) => scenario.category.categoryTitle === selectedTab,
        );

  const allTabs = uniq([
    allCategoriesLabel,
    ...rolePlayInfo.rolePlayScenarios.map(
      (scenario) => scenario.category.categoryTitle,
    ),
  ]);

  useEffect(() => {
    if (!rolePlayId) {
      setSelectedRolePlayScenario(null);
      return;
    }

    if (rolePlayId == selectedRolePlayScenario?.id) {
      return;
    }

    const scenario = rolePlayInfo.rolePlayScenarios.find(
      (scenario) => scenario.id === rolePlayId,
    );
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
    {},
  );

  const onStartRolePlay = ({
    scenario,
    rolePlayInputs,
    gameStat,
    conversationMode,
  }: {
    scenario: RolePlayInstruction;
    rolePlayInputs: RolePlayInputResult[];
    gameStat?: GuessGameStat;
    conversationMode: ConversationMode;
  }) => {
    const instruction = getDefaultInstruction(
      scenario,
      settings.fullLanguageName || "English",
      rolePlayInputs,
    );
    aiConversation.startConversation({
      mode: "role-play",
      customInstruction: instruction,
      voice: scenario.voice,
      gameWords: gameStat,
      analyzeResultAiInstruction: scenario.analyzeResultAiInstruction,
      conversationMode: conversationMode,
    });
  };

  const processInputWithAi = async (
    aiSummarizingInstruction: string,
    value: string,
    lengthToTriggerSummary: number,
    requiredFields: string[],
    isNeedUserInfo: boolean,
    cacheAiSummary: boolean,
  ) => {
    if (!aiSummarizingInstruction || value.length < lengthToTriggerSummary) {
      return value;
    }

    const userInfoString =
      isNeedUserInfo && userInfo.userInfo?.records.length
        ? "\n\nUser Info:" + userInfo.userInfo?.records.join(", ")
        : "";
    const systemMessage =
      aiSummarizingInstruction + requiredFields.join(", ") + userInfoString;

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
      requiredFields: string[],
    ) => Promise<string>
  > = {
    textarea: async (
      input,
      userValue,
      lengthToTriggerSummary,
      requiredFields,
    ) => {
      return processInputWithAi(
        input.aiSummarizingInstruction || "",
        userValue,
        lengthToTriggerSummary,
        requiredFields,
        input.injectUserInfoToSummary || false,
        input.cacheAiSummary !== undefined ? input.cacheAiSummary : true,
      );
    },
    "text-input": async (
      input,
      userValue,
      lengthToTriggerSummary,
      requiredFields,
    ) => {
      return processInputWithAi(
        input.aiSummarizingInstruction || "",
        userValue,
        lengthToTriggerSummary,
        requiredFields,
        input.injectUserInfoToSummary || false,
        input.cacheAiSummary !== undefined ? input.cacheAiSummary : true,
      );
    },
    options: async (
      input,
      userValue,
      lengthToTriggerSummary,
      requiredFields,
    ) => {
      const aiOptions = input.optionsAiDescriptions || {};
      const value = aiOptions[userValue] || userValue;

      return processInputWithAi(
        input.aiSummarizingInstruction || "",
        value,
        lengthToTriggerSummary,
        requiredFields,
        input.injectUserInfoToSummary || false,
        input.cacheAiSummary !== undefined ? input.cacheAiSummary : true,
      );
    },

    checkbox: async (
      input,
      userValue,
      lengthToTriggerSummary,
      requiredFields,
    ) => {
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
          const field = selectedRolePlayScenario.input.find(
            (input) => input.id === fieldId,
          );
          return `${field?.labelForAi || ""}: ${userInputs?.[selectedRolePlayScenario.id + "-" + fieldId]}`;
        });

        let processedUserValue = await modeProcessors[input.type](
          input,
          userValue,
          input.lengthToTriggerSummary || 400,
          requiredFields,
        );

        if (processedUserValue) {
          const inputRecord: RolePlayInputResult = {
            labelForAi: input.labelForAi,
            userValue: processedUserValue,
          };
          return inputRecord;
        }
      }),
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

  const audio = useConversationAudio();
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    await audio.startConversationAudio();

    e.preventDefault();
    if (!selectedRolePlayScenario) return;
    setIsStarting(true);
    const rolePlayInputs = await prepareUserInputs();

    const isNeedToGenerateWords = selectedRolePlayScenario.gameMode === "alias";
    if (isNeedToGenerateWords) {
      const wordsInfo = await generateRandomWord(
        rolePlayInputs
          .map((input) => input.labelForAi + ":" + input.userValue)
          .join(", "),
      );

      onStartRolePlay({
        scenario: selectedRolePlayScenario,
        rolePlayInputs,
        gameStat: wordsInfo,
        conversationMode: "record",
      });
    } else {
      onStartRolePlay({
        scenario: selectedRolePlayScenario,
        rolePlayInputs,
        conversationMode: "record",
      });
    }
    setIsStarting(false);
  };

  return {
    onSubmit,
    closeRolePlay,
    selectedRolePlayScenario,
    userInputs,
    setUserInputs,
    isStarting,
    selectedTab,
    onSetTab,
    allCategoriesLabel,
    allTabs,
    visibleScenarios,
    selectScenario,
    isLimited,
    setIsLimited,
  };
}

export function RolePlayProvider({
  children,
  rolePlayInfo,
}: {
  children: ReactNode;
  rolePlayInfo: RolePlayScenariosInfo;
}): JSX.Element {
  const hook = useProvideRolePlay({ rolePlayInfo });
  return (
    <RolePlayContext.Provider value={hook}>{children}</RolePlayContext.Provider>
  );
}

export const useRolePlay = (): RolePlayContextType => {
  const context = useContext(RolePlayContext);
  if (!context) {
    throw new Error("useRolePlay must be used within a RolePlayProvider");
  }
  return context;
};
