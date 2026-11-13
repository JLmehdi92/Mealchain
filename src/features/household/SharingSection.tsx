import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput } from 'react-native';

import { pick } from '@/lib/i18n';
import { report } from '@/lib/monitoring';
import { supabase } from '@/lib/supabase';
import { Group } from '@/ui/Card';
import { Icon } from '@/ui/Icon';
import { Row } from '@/ui/Row';
import { SectionLabel } from '@/ui/SectionLabel';
import { Secondary } from '@/ui/Text';
import { radius, space, touch, type as typography, useTheme } from '@/ui/theme';

import { shareList } from '../list/share';
import { accountAvailable, joinHousehold, signedIn, signInWithApple, signOut, validInvite } from './account';
import { EditSheet } from './EditSheet';
import { signInFailed } from './signInError';
import { SETTINGS_COPY } from './settingsCopy';

function JoinSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const c = useTheme();
  const copy = pick(SETTINGS_COPY);
  const [code, setCode] = useState('');
  const join = async () => {
    if (!validInvite(code)) return Alert.alert(copy.joinError);
    try {
      await joinHousehold(code);
      onClose();
    } catch (error) {
      report(error);
      Alert.alert(copy.joinError);
    }
  };
  return (
    <EditSheet title={copy.joinTitle} visible={visible} onCancel={onClose} onSave={join} saveLabel={copy.joinAction}>
      <Secondary muted>{copy.joinHint}</Secondary>
      <TextInput
        accessibilityLabel={copy.joinTitle}
        value={code}
        onChangeText={(text) => setCode(text.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        onSubmitEditing={join}
        style={[styles.input, typography.mono, { backgroundColor: c.sheet, color: c.ink, borderColor: c.rule }]}
      />
    </EditSheet>
  );
}

export function SharingSection() {
  const copy = pick(SETTINGS_COPY);
  const [session, setSession] = useState(false);
  const [joining, setJoining] = useState(false);
  useEffect(() => {
    signedIn().then(setSession).catch(report);
    const subscription = supabase?.auth.onAuthStateChange((_event, value) => setSession(!!value));
    return () => subscription?.data.subscription.unsubscribe();
  }, []);
  if (!accountAvailable) return null;
  const signIn = () => signInWithApple().catch((error: unknown) => signInFailed(error, copy.error));
  return (
    <>
      <SectionLabel>{copy.sharing}</SectionLabel>
      <Group>
        {session ? (
          <>
            <Row label={copy.sharedWith} trailing={<Icon name="chevron.right" size={14} muted />} onPress={shareList} />
            <Row label={copy.join} trailing={<Icon name="chevron.right" size={14} muted />} onPress={() => setJoining(true)} />
            <Row label={copy.signOut} onPress={() => signOut().catch(report)} />
          </>
        ) : (
          <Row label={copy.signIn} detail={copy.signInDetail} onPress={signIn} />
        )}
      </Group>
      <JoinSheet visible={joining} onClose={() => setJoining(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: touch.button, borderRadius: radius.control, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: space.lg, letterSpacing: 2 },
});
