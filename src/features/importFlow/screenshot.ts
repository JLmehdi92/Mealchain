import * as ImagePicker from 'expo-image-picker';

import { recognizeText } from '../../../modules/vision-ocr';

export async function pickScreenshot(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
  return result.canceled ? null : (result.assets[0]?.uri ?? null);
}

export const readScreenshot = async (uri: string) => (await recognizeText(uri)).join('\n');
