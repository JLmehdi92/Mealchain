import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ImportInput } from '@/features/importFlow/importRecipe';
import { ChooseSource } from '@/features/importFlow/ui/ChooseSource';
import { ImportError } from '@/features/importFlow/ui/ImportError';
import { ImportLoading } from '@/features/importFlow/ui/ImportLoading';
import { Review } from '@/features/importFlow/ui/Review';
import { SourceInput } from '@/features/importFlow/ui/SourceInput';
import { useImportFlow, type TextSource } from '@/features/importFlow/useImportFlow';
import { useTheme } from '@/ui/theme';

const textSource = (input: ImportInput): TextSource => (input.kind === 'text' ? input.source : 'caption');

export default function Import() {
  const c = useTheme();
  const { phase, setPhase, text, setText, close, run, fromScreenshot, signInAndRun, save } = useImportFlow();
  const [link, setLink] = useState('');
  const choose = () => setPhase({ name: 'choose' });

  const content = () => {
    switch (phase.name) {
      case 'choose':
        return <ChooseSource onClose={close} onLink={() => setPhase({ name: 'link' })} onText={() => setPhase({ name: 'text', source: 'caption' })} onShot={fromScreenshot} />;
      case 'link':
        return <SourceInput kind="link" value={link} onChange={setLink} onBack={choose} onSubmit={() => run({ kind: 'url', url: link.trim() })} />;
      case 'text':
        return <SourceInput kind="text" value={text} onChange={setText} onBack={choose} onSubmit={() => run({ kind: 'text', text, source: phase.source })} />;
      case 'loading':
        return <ImportLoading input={phase.input} step={phase.step} count={phase.count} onCancel={close} />;
      case 'error':
        return (
          <ImportError
            error={phase.error}
            fromLink={phase.input.kind === 'url'}
            onClose={close}
            onRetry={() => run(phase.input)}
            onSignIn={() => signInAndRun(phase.input)}
            onLink={() => setPhase({ name: 'link' })}
            onText={() => setPhase({ name: 'text', source: textSource(phase.input) })}
          />
        );
      case 'review':
        return <Review initial={phase.recipe} onCancel={close} onSave={save} />;
    }
  };

  return <SafeAreaView style={[styles.fill, { backgroundColor: phase.name === 'choose' ? c.sheet : c.paper }]}>{content()}</SafeAreaView>;
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
