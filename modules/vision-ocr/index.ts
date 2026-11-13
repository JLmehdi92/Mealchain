import { requireOptionalNativeModule } from 'expo';

type VisionOcr = { recognizeText(uri: string): Promise<string[]> };

const native = requireOptionalNativeModule<VisionOcr>('VisionOcr');

export async function recognizeText(uri: string): Promise<string[]> {
  return native ? native.recognizeText(uri) : [];
}
