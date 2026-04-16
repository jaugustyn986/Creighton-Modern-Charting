import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthProvider';
import {
  BG_PAGE,
  BG_CARD,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
  TEXT_MUTED,
  BORDER_CARD,
  ACCENT_WARM,
  ACCENT_WARM_TINT,
  BANNER_TONE_CAUTION_BG,
} from '../theme/colors';

export function AuthScreen(): JSX.Element {
  const auth = useAuth();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (auth?.user) {
      navigation.goBack();
    }
  }, [auth?.user, navigation]);

  const handleSendMagicLink = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    auth?.clearAuthCallbackError();
    setSending(true);
    try {
      const { error } = await auth?.signInWithOtp(trimmed) ?? { error: new Error('Not available') };
      if (error) {
        Alert.alert('Could not send link', error.message);
        return;
      }
      Alert.alert(
        'Check your email',
        'Check your email for a sign-in link. Tap the link to sign in.'
      );
    } finally {
      setSending(false);
    }
  }, [email, auth]);

  const callbackError = auth?.lastAuthCallbackError ?? null;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Sign in with email</Text>
        <Text style={styles.subtitle}>
          We'll send you a link to sign in. No password needed.
        </Text>
        {callbackError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorTitle}>Couldn't complete sign-in</Text>
            <Text style={styles.errorMessage}>{callbackError}</Text>
            <Text style={styles.errorHint}>Send a new link and try again.</Text>
          </View>
        ) : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={TEXT_MUTED}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!sending}
        />
        <Pressable
          style={[styles.button, sending && styles.buttonDisabled]}
          onPress={handleSendMagicLink}
          disabled={sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send magic link</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_PAGE, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: BG_CARD,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER_CARD,
  },
  title: { fontSize: 20, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 8 },
  subtitle: { fontSize: 15, color: TEXT_SECONDARY, marginBottom: 20, lineHeight: 22 },
  input: {
    borderWidth: 1,
    borderColor: BORDER_CARD,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: TEXT_PRIMARY,
    marginBottom: 16,
  },
  button: {
    backgroundColor: ACCENT_WARM,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  errorBanner: {
    backgroundColor: BANNER_TONE_CAUTION_BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_CARD,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  errorTitle: { fontSize: 14, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 4 },
  errorMessage: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 20 },
  errorHint: { fontSize: 13, color: TEXT_MUTED, marginTop: 6 },
});
