import type { NavigatorScreenParams } from '@react-navigation/native';

/** Bottom tab routes — the four primary feature screens from the original app. */
export type MainTabParamList = {
  Compare: undefined;
  Database: undefined;
  Quiz: undefined;
  Interactions: undefined;
};

/** Root stack: the tab shell plus modal/detail screens pushed on top. */
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  UnitDetail: { unitId: number };
  About: undefined;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
