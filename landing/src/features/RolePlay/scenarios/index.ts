import { getAliasGameScenario } from './alias-game';
import { getSmallTalkWithAStrangerScenario } from './small-talk-with-a-stranger';
import { getAssistantChatScenario } from './assistant-chat';
import { getCynicalFriendScenario } from './cynical-friend';
import { getStupidInterviewScenario } from './stupid-interview';
import { getSupportiveFriendScenario } from './supportive-friend';
import { getJobInterviewScenario } from './job-interview';
import { getInTheRestaurantScenario } from './in-the-restaurant';
import { getWorkplaceDiscriminationCheckScenario } from './workplace-discrimination-check';
import { getBuyingATrainTicketScenario } from './buying-a-train-ticket';
import { getTalkingToADoctorScenario } from './talking-to-a-doctor';
import { getMeetingDogOwnersInTheParkScenario } from './meeting-dog-owners-in-the-park';
import { getHotelCheckInScenario } from './hotel-check-in';
import { getAtTheGroceryStoreScenario } from './at-the-grocery-store';
import { getCallingTechnicalSupportScenario } from './calling-technical-support';
import { getMakingADoctorsAppointmentScenario } from './making-a-doctors-appointment';
import { getReturningAnItemInAStoreScenario } from './returning-an-item-in-a-store';
import { getMeetingWithPsychologistScenario } from './meeting-with-psychologist';
import { getCustomScenario } from './custom';
import { getCustomConversationScenario } from './custom-conversation';
import { I18n } from '@lingui/core';
import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from '../types';

type ScenarioFactory = (i18n: I18n, lang: SupportedLanguage) => RolePlayInstruction;

export const scenarioFactories: ScenarioFactory[] = [
  getAliasGameScenario,
  getSmallTalkWithAStrangerScenario,
  getAssistantChatScenario,
  getCynicalFriendScenario,
  getStupidInterviewScenario,
  getSupportiveFriendScenario,
  getJobInterviewScenario,
  getInTheRestaurantScenario,
  getWorkplaceDiscriminationCheckScenario,
  getBuyingATrainTicketScenario,
  getTalkingToADoctorScenario,
  getMeetingDogOwnersInTheParkScenario,
  getHotelCheckInScenario,
  getAtTheGroceryStoreScenario,
  getCallingTechnicalSupportScenario,
  getMakingADoctorsAppointmentScenario,
  getReturningAnItemInAStoreScenario,
  getMeetingWithPsychologistScenario,
  getCustomScenario,
  getCustomConversationScenario,
];
