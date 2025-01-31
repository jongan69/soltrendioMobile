import * as ExpoWidgetsModule from '@bittingz/expo-widgets';

export const sendWidgetData = (data: any) => {
  ExpoWidgetsModule.setWidgetData(JSON.stringify({ message: data.toString() }));
};
