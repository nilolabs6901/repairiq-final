import { DiagnosisResult } from '@/types';
import { isNative } from './platform';

/**
 * Share a diagnosis result using the native share sheet (iOS/Android)
 * or Web Share API (modern browsers). Falls back to clipboard copy.
 */
export async function shareDiagnosis(result: DiagnosisResult): Promise<boolean> {
  const title = `RepairIQ Diagnosis: ${result.itemType}`;
  const text = [
    `Diagnosis: ${result.summary}`,
    '',
    `Likely Issues:`,
    ...result.likelyIssues.map((i) => `- ${i.title} (${Math.round(i.probability * 100)}%)`),
    '',
    `Estimated Cost: ${result.estimatedTotalCost}`,
    `Estimated Time: ${result.estimatedTotalTime}`,
  ].join('\n');

  if (isNative()) {
    const { Share } = await import('@capacitor/share');
    await Share.share({ title, text, dialogTitle: 'Share Diagnosis' });
    return true;
  }

  // Web Share API fallback
  if (navigator.share) {
    await navigator.share({ title, text });
    return true;
  }

  // Clipboard fallback
  await navigator.clipboard.writeText(`${title}\n\n${text}`);
  return true;
}
