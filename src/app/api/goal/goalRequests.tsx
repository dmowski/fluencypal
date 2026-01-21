import { CreateGoalRequest, CreateGoalResponse, GoalQuiz } from './types';

export const sendCreateGoalRequest = async (data: CreateGoalRequest) => {
  const response = await fetch(`/api/goal`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const dataResponse = (await response.json()) as CreateGoalResponse;
  return dataResponse;
};

export const getGoalQuiz = async (id: string) => {
  const response = await fetch(`/api/goal?id=${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const dataResponse = (await response.json()) as GoalQuiz | null;
  return dataResponse;
};

export const deleteGoalQuiz = async (id: string) => {
  const response = await fetch(`/api/goal?id=${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const dataResponse = (await response.json()) as GoalQuiz | null;
  return dataResponse;
};
