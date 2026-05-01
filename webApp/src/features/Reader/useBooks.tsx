import { useState } from 'react';
import { testData } from './testData';
import { ReaderData } from './types';

export const useBooks = () => {
  const [active, setActive] = useState<ReaderData | null>(null);
  const usersBooks: ReaderData[] = [];
  const testBooks = [testData];

  return {
    active,
    setActive,
    usersBooks,
    testBooks,
  };
};
