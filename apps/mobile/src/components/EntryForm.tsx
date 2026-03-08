import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { computeMucusRank } from '../../../../core/rulesEngine/src/rank';
import {
  Appearance,
  BleedingType,
  DailyEntry,
  Quantity,
  Sensation,
} from '../../../../core/rulesEngine/src/types';

interface Props {
  initialEntry?: DailyEntry | null;
  date: string;
  onSave: (entry: DailyEntry) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const BLEEDING_OPTIONS: { value: BleedingType; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
  { value: 'brown', label: 'Brown' },
];

const SENSATION_OPTIONS: { value: Sensation; label: string; desc: string; rankHint: string }[] = [
  { value: 'dry', label: 'Dry', desc: 'No sensation at vulva', rankHint: 'Rank 0 - Non-fertile' },
  { value: 'damp', label: 'Damp', desc: 'Slightly moist feeling', rankHint: 'Rank 1 - Early fertile' },
  { value: 'wet', label: 'Wet', desc: 'Wet feeling without slipperiness', rankHint: 'Rank 2 - Fertile' },
  { value: 'slippery', label: 'Slippery', desc: 'Lubricative, slippery sensation', rankHint: 'Rank 3 - Peak fertility!' },
];

const APPEARANCE_OPTIONS: { value: Appearance; label: string; desc: string; rankHint?: string }[] = [
  { value: 'none', label: 'None', desc: 'No visible mucus' },
  { value: 'cloudy', label: 'Cloudy', desc: 'Cloudy, sticky, or pasty' },
  { value: 'clear', label: 'Clear', desc: 'Clear or transparent', rankHint: 'Rank 3 - Peak!' },
  { value: 'stretchy', label: 'Stretchy', desc: 'Stretches between fingers (egg white), or lubricative/slippery on tissue', rankHint: 'Rank 3 - Peak!' },
];

const QUANTITY_OPTIONS: { value: Quantity; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const RANK_LABELS: Record<number, { type: string; desc: string; hint: string }> = {
  0: { type: 'Type 0 - Dry', desc: 'No mucus present. No discharge observed.', hint: 'Dry day. Record as no mucus.' },
  1: { type: 'Type 1 - Damp', desc: 'Sticky, pasty, or cloudy mucus. Non-peak type.', hint: 'Early fertility signs. Non-peak mucus detected.' },
  2: { type: 'Type 2 - Wet', desc: 'Wet, cloudy mucus. Fertile but not peak-type.', hint: 'Fertile day. Cervical mucus is present and wet.' },
  3: { type: 'Type 3 - Peak', desc: 'Clear, stretchy, lubricative, or slippery mucus. Peak-type.', hint: 'Peak fertility! This is your most fertile mucus sign.' },
};

function isContradictory(sensation: Sensation, appearance: Appearance): boolean {
  return sensation === 'dry' && (appearance === 'clear' || appearance === 'stretchy');
}

export function EntryForm({ initialEntry, date, onSave, onCancel, onDelete }: Props): JSX.Element {
  const [missing, setMissing] = useState(initialEntry?.missing ?? false);
  const [bleeding, setBleeding] = useState<BleedingType>(initialEntry?.bleeding ?? 'none');
  const [sensation, setSensation] = useState<Sensation>(initialEntry?.sensation ?? 'dry');
  const [appearance, setAppearance] = useState<Appearance>(initialEntry?.appearance ?? 'none');
  const [quantity, setQuantity] = useState<Quantity>(initialEntry?.quantity ?? 'none');
  const [intercourse, setIntercourse] = useState(initialEntry?.intercourse ?? false);
  const [notes, setNotes] = useState(initialEntry?.notes ?? '');

  const rank = useMemo(
    () => missing ? null : computeMucusRank({ sensation, appearance }),
    [sensation, appearance, missing],
  );

  const contradictory = !missing && isContradictory(sensation, appearance);
  const rankInfo = rank !== null ? RANK_LABELS[rank] : null;

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const handleSave = () => {
    if (missing) {
      onSave({ date, missing: true });
      return;
    }
    onSave({
      date,
      bleeding,
      sensation,
      appearance,
      quantity,
      intercourse,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Observation</Text>
        <View style={styles.dateBox}>
          <Text style={styles.dateText}>{displayDate}</Text>
        </View>
      </View>

      <View style={styles.missingRow}>
        <Text style={styles.missingLabel}>Did you observe today?</Text>
        <Switch value={!missing} onValueChange={(v) => setMissing(!v)} />
      </View>

      {missing ? (
        <View style={styles.missingNote}>
          <Text style={styles.missingNoteText}>
            This day will be marked as missing. Missing days cannot confirm Peak.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Bleeding</Text>
            <View style={styles.pillRow}>
              {BLEEDING_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.pill, bleeding === opt.value && styles.pillSelected]}
                  onPress={() => setBleeding(opt.value)}
                >
                  <Text style={[styles.pillText, bleeding === opt.value && styles.pillTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.mostFertileNote}>
            <Text style={styles.mostFertileText}>
              Record your most fertile observation of the day — not just the most recent.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Sensation at Vulva</Text>
            <View style={styles.cardGrid}>
              {SENSATION_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.card, sensation === opt.value && styles.cardSelected]}
                  onPress={() => setSensation(opt.value)}
                >
                  <Text style={[styles.cardTitle, sensation === opt.value && styles.cardTitleSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.cardDesc}>{opt.desc}</Text>
                  <Text style={[styles.cardHint, opt.rankHint.includes('Peak') && styles.cardHintPeak]}>
                    {opt.rankHint}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Mucus Appearance</Text>
            <View style={styles.cardGrid}>
              {APPEARANCE_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.card, appearance === opt.value && styles.cardSelected]}
                  onPress={() => setAppearance(opt.value)}
                >
                  <Text style={[styles.cardTitle, appearance === opt.value && styles.cardTitleSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.cardDesc}>{opt.desc}</Text>
                  {opt.rankHint && (
                    <Text style={[styles.cardHint, styles.cardHintPeak]}>{opt.rankHint}</Text>
                  )}
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Mucus Quantity</Text>
            <View style={styles.pillRow}>
              {QUANTITY_OPTIONS.map((opt) => (
                <Pressable
                  key={opt.value}
                  style={[styles.pill, quantity === opt.value && styles.pillSelected]}
                  onPress={() => setQuantity(opt.value)}
                >
                  <Text style={[styles.pillText, quantity === opt.value && styles.pillTextSelected]}>
                    {opt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.intercourseRow}>
            <Text style={styles.fieldLabel}>Intercourse Today?</Text>
            <Switch value={intercourse} onValueChange={setIntercourse} />
          </View>
          {intercourse && (
            <Text style={styles.seminalTip}>
              Tip: Seminal fluid can resemble mucus. For the most accurate observation,
              check before intercourse or note any difference in sensation.
            </Text>
          )}

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Notes (Optional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Any additional observations, symptoms, or notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>

          {contradictory && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                You selected Dry sensation with {appearance} appearance. This is unusual —
                please double-check your observation. If accurate, this will be recorded as peak-type mucus.
              </Text>
            </View>
          )}

          {rankInfo && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryType}>{rankInfo.type}</Text>
              <Text style={styles.summaryDesc}>{rankInfo.desc}</Text>
              <Text style={styles.summaryHint}>{rankInfo.hint}</Text>
            </View>
          )}
        </>
      )}

      <View style={styles.buttons}>
        <Pressable style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save Entry</Text>
        </Pressable>
      </View>

      {onDelete && (
        <Pressable style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteText}>Delete Entry</Text>
        </Pressable>
      )}
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  scroll: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b' },
  dateBox: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8,
    padding: 12, marginTop: 8,
  },
  dateText: { fontSize: 15, color: '#1e293b' },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0',
  },
  pillSelected: { backgroundColor: '#fce7f3', borderColor: '#f43f5e' },
  pillText: { fontSize: 13, color: '#475569' },
  pillTextSelected: { color: '#be123c', fontWeight: '600' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    width: '47%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  cardSelected: { backgroundColor: '#fce7f3', borderColor: '#f43f5e' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
  cardTitleSelected: { color: '#be123c' },
  cardDesc: { fontSize: 11, color: '#64748b', marginTop: 2 },
  cardHint: { fontSize: 11, color: '#94a3b8', marginTop: 4 },
  cardHintPeak: { color: '#be123c', fontWeight: '600' },
  intercourseRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff7ed', padding: 14, borderRadius: 10, marginTop: 16,
  },
  seminalTip: {
    fontSize: 12, color: '#92400e', backgroundColor: '#fffbeb',
    padding: 10, borderRadius: 8, marginTop: 6,
  },
  notesInput: {
    borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8,
    padding: 12, minHeight: 80, textAlignVertical: 'top', fontSize: 14,
  },
  warningBox: {
    backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, marginTop: 16,
  },
  warningText: { fontSize: 12, color: '#92400e' },
  summaryBox: {
    backgroundColor: '#f8fafc', padding: 14, borderRadius: 10,
    marginTop: 16, borderWidth: 1, borderColor: '#e2e8f0',
  },
  summaryType: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  summaryDesc: { fontSize: 13, color: '#475569', marginTop: 4 },
  summaryHint: { fontSize: 12, color: '#64748b', marginTop: 6, fontStyle: 'italic' },
  buttons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0',
  },
  cancelText: { fontSize: 15, color: '#475569', fontWeight: '600' },
  saveBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 10, backgroundColor: '#f43f5e',
  },
  saveText: { fontSize: 15, color: '#fff', fontWeight: '700' },
  deleteBtn: { alignItems: 'center', marginTop: 16 },
  deleteText: { fontSize: 14, color: '#ef4444', fontWeight: '500' },
  missingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, backgroundColor: '#f8fafc', borderRadius: 10, marginTop: 12,
  },
  missingLabel: { fontSize: 14, fontWeight: '500', color: '#334155' },
  missingNote: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, marginTop: 8 },
  missingNoteText: { fontSize: 13, color: '#92400e' },
  mostFertileNote: {
    backgroundColor: '#f0fdf4', borderLeftWidth: 3, borderLeftColor: '#16a34a',
    padding: 10, borderRadius: 6, marginTop: 16,
  },
  mostFertileText: { fontSize: 12, color: '#166534', fontStyle: 'italic' },
});
