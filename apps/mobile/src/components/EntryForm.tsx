import React, { useCallback, useMemo, useRef, useState } from 'react';
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
import {
  Appearance,
  BleedingType,
  classifyFertility,
  computeMucusRank,
  DailyEntry,
  derivePrimaryDayClassFromEntry,
  Frequency,
  Sensation,
} from 'core-rules-engine';
import {
  BG_CARD, BG_PAGE, BG_MISSING,
  TEXT_PRIMARY, TEXT_SECONDARY, TEXT_SUBTLE,
  BORDER_CARD, ACCENT_WARM, ACCENT_WARM_TINT, BRAND_NAME, ACCENT_RED,
} from '../theme/colors';

interface Props {
  initialEntry?: DailyEntry | null;
  previousDayEntry?: DailyEntry | null;
  date: string;
  onSave: (entry: DailyEntry) => void;
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

const SENSATION_OPTIONS: { value: Sensation; label: string; desc: string }[] = [
  { value: 'dry', label: 'Dry', desc: 'No sensation' },
  { value: 'damp', label: 'Damp', desc: 'Slightly moist without lubrication' },
  { value: 'wet', label: 'Wet', desc: 'Wet without lubrication' },
  { value: 'shiny', label: 'Shiny', desc: 'Shiny without lubrication' },
  { value: 'sticky', label: 'Sticky', desc: 'Holds together, does not stretch' },
  { value: 'tacky', label: 'Tacky', desc: 'Stretches slightly then breaks' },
  { value: 'stretchy', label: 'Stretchy', desc: 'Stretches 1 inch or more' },
];

const APPEARANCE_OPTIONS: { value: Appearance; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'brown', label: 'Brown' },
  { value: 'cloudy', label: 'Cloudy (white)' },
  { value: 'cloudy_clear', label: 'Cloudy/Clear' },
  { value: 'gummy', label: 'Gummy' },
  { value: 'clear', label: 'Clear' },
  { value: 'lubricative', label: 'Lubricative' },
  { value: 'pasty', label: 'Pasty' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
];

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 1, label: 'Once' },
  { value: 2, label: 'Twice' },
  { value: 3, label: 'Three times' },
  { value: 'all_day', label: 'All day' },
];

const CLASSIFICATION_LABELS: Record<string, { title: string; desc: string; hint: string }> = {
  dry: {
    title: 'Dry Observation',
    desc: 'No mucus observed today.',
    hint: 'Dry day. Record as no mucus.',
  },
  early_fertile: {
    title: 'Early Fertile Observation',
    desc: 'Early mucus signs are present.',
    hint: 'Early fertility signs detected. Continue daily observations.',
  },
  fertile: {
    title: 'Fertile Observation',
    desc: 'Fertile-type mucus is present.',
    hint: 'Fertile day. Cervical mucus indicates fertility.',
  },
  peak_type: {
    title: 'Peak-Type Observation',
    desc: 'Stretchy or lubricative mucus is present.',
    hint: 'Peak fertility! This is your most fertile mucus sign.',
  },
};

export function EntryForm({ initialEntry, previousDayEntry, date, onSave, onDelete }: Props): JSX.Element {
  const [missing, setMissing] = useState(initialEntry?.missing ?? false);
  const [bleeding, setBleeding] = useState<BleedingType>(initialEntry?.bleeding ?? 'none');
  const [sensation, setSensation] = useState<Sensation>(initialEntry?.sensation ?? 'dry');
  const [appearances, setAppearances] = useState<Appearance[]>(initialEntry?.appearances ?? []);
  const [frequency, setFrequency] = useState<Frequency | undefined>(initialEntry?.frequency);
  const [showFreqInfo, setShowFreqInfo] = useState(false);
  const [showNotesInfo, setShowNotesInfo] = useState(false);
  const [intercourse, setIntercourse] = useState(initialEntry?.intercourse ?? false);
  const [notes, setNotes] = useState(initialEntry?.notes ?? '');

  const [sameAsYesterday, setSameAsYesterday] = useState(false);
  const preToggleSnapshot = useRef<{ sensation: Sensation; appearances: Appearance[] } | null>(null);

  const showSameAsYesterday =
    !missing &&
    !initialEntry &&
    previousDayEntry != null &&
    !previousDayEntry.missing;

  const handleSameAsYesterday = useCallback((on: boolean) => {
    if (on && previousDayEntry) {
      preToggleSnapshot.current = { sensation, appearances: [...appearances] };
      setSensation(previousDayEntry.sensation ?? 'dry');
      setAppearances(previousDayEntry.appearances ?? []);
    } else if (!on && preToggleSnapshot.current) {
      setSensation(preToggleSnapshot.current.sensation);
      setAppearances(preToggleSnapshot.current.appearances);
      preToggleSnapshot.current = null;
    }
    setSameAsYesterday(on);
  }, [previousDayEntry, sensation, appearances]);

  const rank = useMemo(
    () => (missing ? null : computeMucusRank({ sensation, appearances })),
    [sensation, appearances, missing],
  );

  const classInfo = useMemo(() => {
    if (missing || rank === null) return null;
    const draft: DailyEntry = { bleeding, sensation, appearances };
    const primary = derivePrimaryDayClassFromEntry(draft, rank);
    if (primary === 'menstrual_flow') {
      return {
        title: 'Menstrual flow day',
        desc: 'Bleeding is logged as menstrual flow. Mucus is still recorded but is not interpreted as Peak-type for this day.',
        hint: 'Record flow and any sensations; continue your daily observations.',
      };
    }
    if (primary === 'spotting') {
      return {
        title: 'Spotting',
        desc: 'Light bleeding or spotting without full flow.',
        hint: 'Note sensation and appearance alongside spotting.',
      };
    }
    const classification = classifyFertility({ sensation, appearances });
    return CLASSIFICATION_LABELS[classification] ?? null;
  }, [missing, rank, bleeding, sensation, appearances]);

  const displayDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const toggleAppearance = (value: Appearance) => {
    if (value === 'none') {
      setAppearances([]);
      return;
    }
    setAppearances((prev) => {
      const filtered = prev.filter((a) => a !== 'none');
      if (filtered.includes(value)) {
        return filtered.filter((a) => a !== value);
      }
      return [...filtered, value];
    });
  };

  const handleSave = () => {
    if (missing) {
      onSave({ date, missing: true });
      return;
    }
    onSave({
      date,
      bleeding,
      sensation,
      appearances: appearances.length > 0 ? appearances : undefined,
      frequency,
      intercourse,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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

      {showSameAsYesterday ? (
        <View style={styles.sameAsYesterdayRow}>
          <Text style={styles.missingLabel}>Same as yesterday?</Text>
          <Switch value={sameAsYesterday} onValueChange={handleSameAsYesterday} />
        </View>
      ) : null}

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
            <Text style={styles.fieldLabel}>Sensation</Text>
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
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.fieldLabel}>Appearance</Text>
            <View style={styles.pillRow}>
              {APPEARANCE_OPTIONS.map((opt) => {
                const isNone = opt.value === 'none';
                const selected = isNone
                  ? appearances.length === 0
                  : appearances.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    style={[styles.pill, selected && styles.pillSelected]}
                    onPress={() => toggleAppearance(opt.value)}
                  >
                    <Text style={[styles.pillText, selected && styles.pillTextSelected]}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Observed During the Day</Text>
              <Pressable onPress={() => setShowFreqInfo(!showFreqInfo)} hitSlop={8}>
                <View style={styles.infoBubble}>
                  <Text style={styles.infoBubbleText}>i</Text>
                </View>
              </Pressable>
            </View>
            {showFreqInfo && (
              <Text style={styles.infoTooltip}>
                How many times you noticed this observation during the day.
              </Text>
            )}
            <View style={styles.pillRow}>
              {FREQUENCY_OPTIONS.map((opt) => (
                <Pressable
                  key={String(opt.value)}
                  style={[styles.pill, frequency === opt.value && styles.pillSelected]}
                  onPress={() => setFrequency(frequency === opt.value ? undefined : opt.value)}
                >
                  <Text style={[styles.pillText, frequency === opt.value && styles.pillTextSelected]}>
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
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Notes (Optional)</Text>
              <Pressable onPress={() => setShowNotesInfo(!showNotesInfo)} hitSlop={8}>
                <View style={styles.infoBubble}>
                  <Text style={styles.infoBubbleText}>i</Text>
                </View>
              </Pressable>
            </View>
            {showNotesInfo && (
              <Text style={styles.infoTooltip}>
                Use notes to record PMS symptoms, mood, energy levels, or anything else you want to remember about this day.
              </Text>
            )}
            <TextInput
              style={styles.notesInput}
              placeholder="Any additional observations, symptoms, or notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
            />
          </View>

          {classInfo && (
            <View style={styles.summaryBox}>
              <Text style={styles.summaryType}>{classInfo.title}</Text>
              <Text style={styles.summaryDesc}>{classInfo.desc}</Text>
              <Text style={styles.summaryHint}>{classInfo.hint}</Text>
            </View>
          )}
        </>
      )}

      {onDelete && (
        <Pressable style={styles.deleteBtn} onPress={onDelete}>
          <Text style={styles.deleteText}>Delete Entry</Text>
        </Pressable>
      )}
    </ScrollView>
    <View style={styles.stickyFooter}>
      <Pressable style={styles.saveBtnSticky} onPress={handleSave}>
        <Text style={styles.saveText}>Save Entry</Text>
      </Pressable>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  scroll: { flex: 1, backgroundColor: BG_CARD },
  scrollContent: { padding: 16, paddingBottom: 120 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 21, fontWeight: '600', color: TEXT_PRIMARY },
  dateBox: {
    borderWidth: 1, borderColor: BORDER_CARD, borderRadius: 8,
    padding: 12, marginTop: 8,
  },
  dateText: { fontSize: 15, fontWeight: '400', color: TEXT_PRIMARY },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: TEXT_SECONDARY, marginBottom: 8 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: BORDER_CARD,
  },
  pillSelected: { backgroundColor: ACCENT_WARM_TINT, borderColor: ACCENT_WARM },
  pillText: { fontSize: 14, fontWeight: '400', color: TEXT_SECONDARY },
  pillTextSelected: { color: BRAND_NAME, fontWeight: '600' },
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: {
    width: '47%',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER_CARD,
    backgroundColor: BG_CARD,
  },
  cardSelected: { backgroundColor: ACCENT_WARM_TINT, borderColor: ACCENT_WARM },
  cardTitle: { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY },
  cardTitleSelected: { color: BRAND_NAME },
  cardDesc: { fontSize: 11, color: TEXT_SUBTLE, marginTop: 2 },
  intercourseRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: ACCENT_WARM_TINT, padding: 16, borderRadius: 10, marginTop: 16,
  },
  seminalTip: {
    fontSize: 12, color: '#92400e', backgroundColor: '#fffbeb',
    padding: 10, borderRadius: 8, marginTop: 8,
  },
  notesInput: {
    borderWidth: 1, borderColor: BORDER_CARD, borderRadius: 8,
    padding: 12, minHeight: 80, textAlignVertical: 'top', fontSize: 14, color: TEXT_PRIMARY,
  },
  summaryBox: {
    backgroundColor: BG_PAGE, padding: 16, borderRadius: 10,
    marginTop: 16, borderWidth: 1, borderColor: BORDER_CARD,
  },
  summaryType: { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY },
  summaryDesc: { fontSize: 14, fontWeight: '400', color: TEXT_SECONDARY, marginTop: 4, lineHeight: 22 },
  summaryHint: { fontSize: 14, fontWeight: '400', color: TEXT_SUBTLE, marginTop: 8, fontStyle: 'italic' },
  stickyFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    backgroundColor: BG_CARD,
    borderTopWidth: 1,
    borderTopColor: BORDER_CARD,
  },
  saveBtnSticky: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: ACCENT_WARM,
  },
  saveText: { fontSize: 15, color: BG_CARD, fontWeight: '600' },
  deleteBtn: { alignItems: 'center', marginTop: 24 },
  deleteText: { fontSize: 14, color: ACCENT_RED, fontWeight: '500' },
  missingRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: BG_MISSING, borderRadius: 10, marginTop: 16,
  },
  sameAsYesterdayRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: BG_MISSING, borderRadius: 10, marginTop: 8,
  },
  missingLabel: { fontSize: 14, fontWeight: '500', color: TEXT_SECONDARY },
  missingNote: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, marginTop: 8 },
  missingNoteText: { fontSize: 14, fontWeight: '400', color: '#92400e', lineHeight: 22 },
  mostFertileNote: {
    backgroundColor: '#f0fdf4', borderLeftWidth: 3, borderLeftColor: '#16a34a',
    padding: 10, borderRadius: 8, marginTop: 16,
  },
  mostFertileText: { fontSize: 12, color: '#166534', fontStyle: 'italic' },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoBubble: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: BG_MISSING, justifyContent: 'center', alignItems: 'center',
  },
  infoBubbleText: { fontSize: 11, fontWeight: '700', color: TEXT_SUBTLE },
  infoTooltip: {
    fontSize: 12, color: TEXT_SUBTLE, backgroundColor: BG_PAGE,
    padding: 8, borderRadius: 8, marginBottom: 8,
  },
});
