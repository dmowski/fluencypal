import FirebaseFirestore from '@google-cloud/firestore';
import {
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  SnapshotOptions,
} from 'firebase/firestore';
import { firestore } from './init';
import { PaymentLog, TotalUsageInfo, UsageLog } from '@/features/Usage/usage';
import { UserSettings } from '@/features/Settings/userSettings';
import { Conversation } from '@/features/Conversation/conversation';
import { DailyTaskProgress, UserTaskStats } from '@/features/Tasks/types';
import { WordsStats } from '@/features/Words/words';
import { AiUserInfo } from '@/features/User/userInfo';
import { SupportedLanguage } from '@/features/Lang/lang';
import { PhraseCorrection } from '@/features/Corrections/types';
import { GoalPlan } from '@/features/Plan/types';
import {
  GameAvatars,
  GameLastVisit,
  GameUserNames,
  GameUsersAchievements,
  GameUsersPoints,
} from '@/features/Game/types';
import { QuizSurvey2 } from '@/features/Goal/Quiz/types';
import { InterviewQuizSurvey } from '@/features/Case/types';
import {
  ChatLike,
  ChatSpaceUserReadMetadata,
  ThreadsMessage,
  UserChatMetadata,
} from '@/features/Chat/type';
import { GameBattle } from '@/features/Game/Battle/types';
import { Story, StoryStat, StoryState } from '@/features/Sentence/types';
import { AudioCache } from '@/features/Audio/types';
import { CommunitySpace, CommunitySpaceSettings } from '@/features/Community/types';
import { Homework } from '@/features/Homework/homework';
import { ProgressStat } from '@/features/ProgressStat/types';
import { ReaderBookDoc } from '@/features/Reader/server/readerBookDoc';
import {
  BlogCategoryDocument,
  BlogDocMeta,
  BlogMetadataCategoryDoc,
  BlogVersionDoc,
} from '@/features/Blog/types';
import { NewsStat } from '@/features/News/types';
import { QuizStat, UserQuizRecord } from '@/features/Quiz/types';

interface FirestoreDataConverter<T> {
  toFirestore(model: T): any;
  fromFirestore(snapshot: unknown, options?: SnapshotOptions): T;
}

const converter = <T>() => ({
  toFirestore: (data: Partial<T>) => data,
  fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) => snap.data() as T,
});

const dataPointCollectionCache: Record<string, unknown> = {};

export const dataPointCollection = <T>(collectionPath: string) => {
  const cache = dataPointCollectionCache[collectionPath];
  if (cache) {
    return cache as CollectionReference<T>;
  }
  const colRef = collection(firestore, collectionPath).withConverter(
    converter<T>() as FirestoreDataConverter<T>,
  );
  dataPointCollectionCache[collectionPath] = colRef;
  return colRef;
};

const dataPointDocCache: Record<string, unknown> = {};

export const dataPointDoc = <T>(documentPath: string) => {
  const cache = dataPointDocCache[documentPath];
  if (cache) {
    return cache as DocumentReference<T, any>;
  }
  const docRef = doc(firestore, documentPath).withConverter(
    converter<T>() as FirestoreDataConverter<T>,
  );
  dataPointDocCache[documentPath] = docRef;
  return docRef;
};

export const db = {
  collections: {
    homework: (userId?: string) =>
      userId ? dataPointCollection<Homework>(`users/${userId}/homeworks`) : null,

    userChatList: (userId?: string) =>
      userId ? dataPointCollection<UserChatMetadata>(`chat`) : null,

    stories: (userId?: string) => (userId ? dataPointCollection<Story>(`stories`) : null),

    storyStats: (userId?: string) =>
      userId ? dataPointCollection<StoryStat>(`stats/stories/stats`) : null,

    newsStats: () => dataPointCollection<NewsStat>(`stats/news/stats`),

    quizStats: () => dataPointCollection<QuizStat>(`stats/quiz/stats`),

    usersChatMessages: (space: string, userId: string) =>
      userId ? dataPointCollection<ThreadsMessage>(`chat/${space}/messages`) : null,

    usersChatLikes: (space: string, userId: string) =>
      userId ? dataPointCollection<ChatLike>(`chat/${space}/likes`) : null,

    battle: (userId?: string) => (userId ? dataPointCollection<GameBattle>(`battles`) : null),

    conversation: (userId?: string) =>
      userId ? dataPointCollection<Conversation>(`users/${userId}/conversations`) : null,

    paymentLog: (userId?: string) =>
      userId ? dataPointCollection<PaymentLog>(`users/${userId}/payments`) : null,

    phraseCorrections: (userId?: string) =>
      userId ? dataPointCollection<PhraseCorrection>(`users/${userId}/phraseCorrections`) : null,

    goals: (userId?: string) =>
      userId ? dataPointCollection<GoalPlan>(`users/${userId}/goals`) : null,

    communitySpaces: (userId?: string) =>
      userId ? dataPointCollection<CommunitySpace>(`community/spaces/spaceList`) : null,

    dailyTaskProgress: (userId?: string) =>
      userId ? dataPointCollection<DailyTaskProgress>(`users/${userId}/dailyTasks`) : null,

    progressStats: (userId?: string) =>
      userId ? dataPointCollection<ProgressStat>(`users/${userId}/progressStats`) : null,

    readerBooks: () => dataPointCollection<ReaderBookDoc>(`books`),

    blogs: () => dataPointCollection<BlogDocMeta>(`blogs`),

    blogVersions: (blogId?: string) =>
      blogId ? dataPointCollection<BlogVersionDoc>(`blogs/${blogId}/versions`) : null,

    blogCategories: () =>
      dataPointCollection<BlogCategoryDocument>(`blogMetadata/category/categories`),

    quizzes: (userId?: string) =>
      userId ? dataPointCollection<UserQuizRecord>(`users/${userId}/quizzes`) : null,
  },
  documents: {
    chat: (userId: string, space: string) =>
      space && userId ? dataPointDoc<UserChatMetadata>(`chat/${space}`) : null,

    storyStats: (userId?: string, storyId?: string) =>
      userId && storyId ? dataPointDoc<StoryStat>(`stats/stories/stats/${storyId}`) : null,

    newsStats: (newsId?: string) =>
      newsId ? dataPointDoc<NewsStat>(`stats/news/stats/${newsId}`) : null,

    quizStats: (quizId?: string) =>
      quizId ? dataPointDoc<QuizStat>(`stats/quiz/stats/${quizId}`) : null,

    dailyTaskProgress: (userId?: string, dayIso?: string, languageCode?: SupportedLanguage) =>
      userId && dayIso && languageCode
        ? dataPointDoc<DailyTaskProgress>(`users/${userId}/dailyTasks/${dayIso}_${languageCode}`)
        : null,

    chatSpaceUserReadMetadata: (userId: string) =>
      userId
        ? dataPointDoc<ChatSpaceUserReadMetadata>(`users/${userId}/stats/chatSpaceUserReadMetadata`)
        : null,

    storyReadProgress: (userId: string, storyHash: string) =>
      userId && storyHash
        ? dataPointDoc<StoryState>(`users/${userId}/stats/story_${storyHash}`)
        : null,

    audioCache: (userId: string, audioHash: string) =>
      userId && audioHash ? dataPointDoc<AudioCache>(`audioCache/${audioHash}`) : null,

    homework: (userId?: string, homeworkId?: string) =>
      userId && homeworkId
        ? dataPointDoc<Homework>(`users/${userId}/homeworks/${homeworkId}`)
        : null,
    totalUsage: (userId?: string) =>
      userId ? dataPointDoc<TotalUsageInfo>(`users/${userId}/usage/totalUsage`) : null,

    gameRate2: dataPointDoc<GameUsersPoints>(`game2/gamePoints`),
    gameLastVisit2: dataPointDoc<GameLastVisit>(`game2/gameLastVisit`),
    gameAvatars2: dataPointDoc<GameAvatars>(`game2/gameAvatars`),
    gameUserNames2: dataPointDoc<GameUserNames>(`game2/gameUserNames`),
    gameUserAchievements2: dataPointDoc<GameUsersAchievements>(`game2/gameUserAchievements`),

    usageLog: (userId?: string, usageId?: string) =>
      userId && usageId ? dataPointDoc<UsageLog>(`users/${userId}/usageLogs/${usageId}`) : null,

    userSettings: (userId?: string) =>
      userId ? dataPointDoc<UserSettings>(`users/${userId}`) : null,

    userTasksStats: (userId: string | null, language: SupportedLanguage | null) =>
      userId && language
        ? dataPointDoc<UserTaskStats>(`users/${userId}/stats/tasks_${language}`)
        : null,

    aiUserInfo: (userId: string | null) =>
      userId ? dataPointDoc<AiUserInfo>(`users/${userId}/stats/aiUserInfo`) : null,

    conversation: (userId?: string, conversationId?: string) =>
      userId && conversationId
        ? dataPointDoc<Conversation>(`users/${userId}/conversations/${conversationId}`)
        : null,

    userWordsStats: (userId: string | null, language: SupportedLanguage | null) =>
      userId && language
        ? dataPointDoc<WordsStats>(`users/${userId}/stats/words_${language}`)
        : null,

    quizSurvey2: (userId?: string, learningLanguage?: SupportedLanguage) =>
      userId && learningLanguage
        ? dataPointDoc<QuizSurvey2>(`users/${userId}/quiz2/${learningLanguage}`)
        : null,

    communitySpaceSettings: (userId?: string) =>
      userId
        ? dataPointDoc<CommunitySpaceSettings>(`users/${userId}/settings/communitySpace`)
        : null,

    interviewQuizSurvey: (userId?: string, interviewId?: string) =>
      userId && interviewId
        ? dataPointDoc<InterviewQuizSurvey>(`users/${userId}/interview/${interviewId}`)
        : null,

    progressStat: (userId?: string, statId?: string) =>
      userId && statId
        ? dataPointDoc<ProgressStat>(`users/${userId}/progressStats/${statId}`)
        : null,

    readerBook: (bookId?: string) =>
      bookId ? dataPointDoc<ReaderBookDoc>(`books/${bookId}`) : null,

    blogMeta: (blogId?: string) => (blogId ? dataPointDoc<BlogDocMeta>(`blogs/${blogId}`) : null),

    blogVersion: (blogId?: string, versionId?: string) =>
      blogId && versionId
        ? dataPointDoc<BlogVersionDoc>(`blogs/${blogId}/versions/${versionId}`)
        : null,

    blogMetadataCategory: () =>
      dataPointDoc<BlogMetadataCategoryDoc>(`blogMetadata/category`),

    blogCategory: (categoryId?: string) =>
      categoryId
        ? dataPointDoc<BlogCategoryDocument>(`blogMetadata/category/categories/${categoryId}`)
        : null,

    quiz: (userId?: string, quizId?: string) =>
      userId && quizId
        ? dataPointDoc<UserQuizRecord>(`users/${userId}/quizzes/${quizId}`)
        : null,
  },
};
