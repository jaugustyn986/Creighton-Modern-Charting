import React, { useCallback, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import { shareAsync } from 'expo-sharing';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getAllEntries, clearAllEntries } from '../services/storageV2';
import { useAuth } from '../context/AuthProvider';
import { useSync } from '../context/SyncProvider';
import { hasSupabaseEnv } from '../config/env';
import { LineIcon, type IconName } from '../components/LineIcon';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  BG_PAGE, BG_CARD,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_MUTED,
  BORDER_CARD, ACCENT_RED, ACCENT_WARM, ACCENT_WARM_TINT,
} from '../theme/colors';

const APP_VERSION = Constants.expoConfig?.version ?? '0.1.0';

const PRIVACY_ITEMS: { icon: IconName; text: string }[] = [
  { icon: 'device', text: 'Your entries are stored locally on your device' },
  { icon: 'analytics', text: 'The app uses your observations to calculate cycle patterns' },
  { icon: 'shield', text: 'No third-party ad tracking is used' },
  { icon: 'lock', text: 'You can clear or export your data at any time' },
];

type SettingsNav = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export function SettingsScreen(): JSX.Element {
  const navigation = useNavigation<SettingsNav>();
  const auth = useAuth();
  const sync = useSync();
  const [showClearModal, setShowClearModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const showBackupSync = hasSupabaseEnv();

  const handleExportJson = useCallback(async () => {
    setExporting(true);
    try {
      const entries = await getAllEntries();
      const json = JSON.stringify(entries, null, 2);
      const fileUri = FileSystem.cacheDirectory + 'well-within-data.json';
      await FileSystem.writeAsStringAsync(fileUri, json);
      await shareAsync(fileUri, { mimeType: 'application/json' });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not export data.';
      Alert.alert('Export Failed', msg);
    } finally {
      setExporting(false);
    }
  }, []);

  const handleClearAll = useCallback(async () => {
    setShowClearModal(false);
    try {
      await clearAllEntries();
      Alert.alert('Data Cleared', 'All observations and cycle history have been removed.');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Could not clear data.';
      Alert.alert('Error', msg);
    }
  }, []);

  const formatSyncTime = (iso: string | null) => {
    if (!iso) return 'Not synced yet';
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      {showBackupSync && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Backup & Sync</Text>
          <Text style={styles.sectionSubtitle}>
            Your observations stay private. You can keep using the app without an account.
          </Text>
          {auth?.user ? (
            <>
              <Text style={styles.syncStatus}>
                Signed in with email {auth.user.email}
              </Text>
              <Text style={styles.syncMeta}>
                Last sync: {formatSyncTime(sync?.lastSyncedAt ?? null)}
              </Text>
              {sync?.lastSyncError ? (
                <Text style={styles.syncError}>{sync.lastSyncError}</Text>
              ) : null}
              <Pressable
                style={[styles.actionRow, { marginTop: 12 }]}
                onPress={() => void sync?.syncNow?.()}
                disabled={sync?.isSyncing}
              >
                <View style={styles.actionLeft}>
                  <View style={styles.actionIconCircle}>
                    <Text style={styles.actionIconText}>{'↻'}</Text>
                  </View>
                  <View>
                    <Text style={styles.actionTitle}>
                      {sync?.isSyncing ? 'Syncing...' : 'Sync now'}
                    </Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                style={[styles.actionRow, styles.dangerRow]}
                onPress={() => void auth?.signOut?.()}
              >
                <View style={styles.actionLeft}>
                  <Text style={[styles.actionTitle, styles.dangerText]}>Sign out</Text>
                </View>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={styles.actionRow}
              onPress={() => navigation.navigate('Auth')}
            >
              <View style={styles.actionLeft}>
                <View style={styles.actionIconCircle}>
                  <Text style={styles.actionIconText}>{'↑'}</Text>
                </View>
                <View>
                  <Text style={styles.actionTitle}>Sign in with email</Text>
                  <Text style={styles.actionSub}>Back up your data with a free account</Text>
                </View>
              </View>
              <Text style={styles.actionChevron}>{'›'}</Text>
            </Pressable>
          )}
        </View>
      )}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Privacy</Text>
        <Text style={styles.sectionSubtitle}>How your data works</Text>
        {PRIVACY_ITEMS.map((item, i) => (
          <View key={i} style={styles.privacyRow}>
            <LineIcon name={item.icon} size={20} />
            <Text style={styles.privacyText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Data Management</Text>

        <Pressable style={styles.actionRow} onPress={handleExportJson} disabled={exporting}>
          <View style={styles.actionLeft}>
            <View style={styles.actionIconCircle}>
              <Text style={styles.actionIconText}>{'↓'}</Text>
            </View>
            <View>
              <Text style={styles.actionTitle}>{exporting ? 'Exporting...' : 'Export Data'}</Text>
              <Text style={styles.actionSub}>Download your data as JSON</Text>
            </View>
          </View>
          <Text style={styles.actionChevron}>{'›'}</Text>
        </Pressable>

        <Pressable style={[styles.actionRow, styles.dangerRow]} onPress={() => setShowClearModal(true)}>
          <View style={styles.actionLeft}>
            <View style={[styles.actionIconCircle, styles.dangerIconCircle]}>
              <Text style={styles.dangerIconText}>{'×'}</Text>
            </View>
            <View>
              <Text style={[styles.actionTitle, styles.dangerText]}>Clear All Data</Text>
              <Text style={styles.actionSub}>Remove all observations and cycle history</Text>
            </View>
          </View>
          <Text style={styles.actionChevron}>{'›'}</Text>
        </Pressable>
      </View>

      <Text style={styles.versionText}>Well Within  ·  v{APP_VERSION}</Text>

      <Modal visible={showClearModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Clear All Data?</Text>
            <Text style={styles.modalBody}>
              This will permanently remove all your observations and cycle history. This action cannot be undone.
            </Text>
            <View style={styles.modalButtons}>
              <Pressable style={styles.modalBtnOutline} onPress={() => setShowClearModal(false)}>
                <Text style={styles.modalBtnOutlineText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalBtnDanger} onPress={handleClearAll}>
                <Text style={styles.modalBtnDangerText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: BG_PAGE },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: BG_CARD,
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER_CARD,
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 2 },
  sectionSubtitle: { fontSize: 14, color: TEXT_MUTED, marginBottom: 16 },
  privacyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  privacyText: { fontSize: 15, fontWeight: '400', color: TEXT_SECONDARY, flex: 1, lineHeight: 22 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER_CARD,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  actionIconCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: ACCENT_WARM_TINT,
    justifyContent: 'center', alignItems: 'center',
  },
  actionIconText: { fontSize: 18, color: ACCENT_WARM, fontWeight: '600' },
  dangerIconCircle: { backgroundColor: '#fff1f2' },
  dangerIconText: { fontSize: 20, color: ACCENT_RED, fontWeight: '600' },
  actionTitle: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
  actionSub: { fontSize: 12, color: TEXT_MUTED, marginTop: 1 },
  actionChevron: { fontSize: 20, color: TEXT_MUTED },
  dangerRow: { borderTopWidth: 0, marginTop: 4 },
  dangerText: { color: ACCENT_RED },
  syncStatus: { fontSize: 15, color: TEXT_PRIMARY, marginBottom: 4 },
  syncMeta: { fontSize: 13, color: TEXT_MUTED, marginBottom: 4 },
  syncError: { fontSize: 13, color: ACCENT_RED, marginBottom: 8 },
  versionText: {
    fontSize: 13, color: TEXT_MUTED, textAlign: 'center', marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  modalCard: {
    backgroundColor: BG_CARD,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: { fontSize: 18, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 10 },
  modalBody: { fontSize: 15, fontWeight: '400', color: TEXT_SECONDARY, lineHeight: 22, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBtnOutline: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER_CARD,
    alignItems: 'center',
  },
  modalBtnOutlineText: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
  modalBtnDanger: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: ACCENT_RED,
    alignItems: 'center',
  },
  modalBtnDangerText: { fontSize: 15, fontWeight: '600', color: '#ffffff' },
});
