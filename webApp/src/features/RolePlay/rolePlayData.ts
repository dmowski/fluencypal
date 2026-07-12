import { SupportedLanguage } from '@/features/Lang/lang';
import { RolePlayInstruction } from './types';
import { getI18nInstance } from '@/appRouterI18n';
import { ResourceCategory } from './resourceCategory';
import { scenarioFactories } from './scenarios';

export interface RolePlayScenariosInfo {
  rolePlayScenarios: RolePlayInstruction[];
  categoriesList: ResourceCategory[];
  allCategory: ResourceCategory;
}

export const getRolePlayScenarios = (lang: SupportedLanguage): RolePlayScenariosInfo => {
  const i18n = getI18nInstance(lang);
  const rolePlayScenarios = scenarioFactories.map((factory) => factory(i18n, lang));

  const categoriesList: ResourceCategory[] = [];

  rolePlayScenarios.forEach((rolePlay) => {
    const category = rolePlay.category;
    if (!categoriesList.find((cat) => cat.categoryId === category.categoryId)) {
      categoriesList.push(category);
    }
  });

  const allCategory = {
    categoryTitle: i18n._(`All Scenarios`),
    categoryId: 'all',
    isAllResources: true,
  };

  categoriesList.unshift(allCategory);
  return { rolePlayScenarios, categoriesList, allCategory };
};
