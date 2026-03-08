# Creighton Method Reference

> This document is the single source of truth for all Creighton Model context in this project. It covers the official recording system, how it maps to our app fields, sticker conventions, practitioner insights, and compliance notes. It is intended to keep the development team aligned with the method without bloating the PRD or rules engine spec.

---

## 1. Overview

The Creighton Model FertilityCare System is a standardized, observation-based method of fertility charting. It works by having a woman record specific characteristics of vaginal discharge (mucus) and bleeding each day. A trained practitioner reviews these charts to identify the fertile window, detect hormonal patterns, and flag potential reproductive health concerns.

### Core principles

- Observations are made at the end of the day and recorded based on the **most fertile sign seen that day**.
- The system is entirely based on **observed data** — it does not predict or estimate.
- The resulting chart is a **diagnostic tool**: abnormal patterns (brown bleeding, long mucus cycles, short post-peak phases) can indicate conditions like endometriosis, PCOS, hormonal imbalances, or luteal phase defects.
- Charts can be shared with a NaPro Technology physician for further medical evaluation.

### What this means for the app

Holistic Cycle digitizes this observation system. The app is designed to be **method-compatible but brand-neutral** — it follows the Creighton observation and interpretation rules without claiming official affiliation. See Section 8 for compliance notes.

### Why charting matters (practitioner context)

From practitioners working with the method:

- Women consistently report they wish they had learned this system earlier — it gives them a language for what their body is doing.
- Charting reveals the impact of external factors: stress, dietary changes (e.g. reducing processed foods), sleep, and lifestyle all show up in the mucus pattern.
- Abnormal findings are not alarming — they are informative. They give a starting point for health interventions rather than a reason for fear.
- The goal for the user is to become a "listener of your body." The app should support that, not overwhelm it.

---

## 2. Vaginal Discharge Recording System

This is the official Creighton recording system. Each day's observation is recorded as a combination of a **numeric code** (sensation/consistency) and one or more **letter codes** (color/appearance).

### Numeric codes — sensation and consistency

| Code | Description |
|---|---|
| `0` | Dry |
| `2` | Damp without lubrication |
| `2W` | Wet without lubrication |
| `4` | Shiny without lubrication |
| `6` | Sticky (¼ inch / 0.5 cm) |
| `8` | Tacky (¾–¾ inch / 1.0–2.0 cm) |
| `10` | Stretchy (1 inch+ / 2.5 cm or more) |
| `10DL` | Damp with lubrication |
| `10SL` | Shiny with lubrication |
| `10WL` | Wet with lubrication |

Codes 6, 8, 10, 10DL, 10SL, and 10WL are all classified as **mucus-present** days. Codes 0–4 are **non-mucus** days.

### Letter codes — color and appearance

| Code | Description |
|---|---|
| `B` | Brown (or black) bleeding |
| `C` | Cloudy (white) |
| `C/K` | Cloudy/clear |
| `G` | Gummy (gluey) |
| `K` | Clear |
| `L` | Lubricative |
| `P` | Pasty (creamy) |
| `R` | Red |
| `Y` | Yellow (even pale yellow) |

**Peak-type mucus** is defined as any mucus that is clear, stretchy, or lubricative (codes K, L, or stretchy 10). **Non-peak mucus** is anything that does not meet that definition.

### Bleeding codes

| Code | Description |
|---|---|
| `H` | Heavy flow |
| `M` | Moderate flow |
| `L` | Light flow |
| `VL` | Very light flow (spotting) |
| `B` | Brown (or black) bleeding |

The presence of mucus during light and very light days of the menstrual flow is always recorded.

### Observation frequency codes

How often during the day the most fertile sign was seen:

| Code | Meaning |
|---|---|
| `X1` | Seen once that day |
| `X2` | Seen twice that day |
| `X3` | Seen three times that day |
| `AD` | Seen all day |

---

## 3. Code-to-App Field Mapping

Our app uses simplified fields (sensation, appearance) rather than the full Creighton code notation. This table shows the mapping so that users familiar with the paper system can orient themselves, and so developers understand what each app input represents in Creighton terms.

| Official Code | Example Full Notation | App: Sensation | App: Appearance | Mucus Rank |
|---|---|---|---|---|
| `0` | 0 | dry | none | 0 |
| `2` | 2 | damp | none | 1 |
| `2W` | 2W | wet | none | 2 |
| `4` | 4 | damp | none | 1 |
| `6` + C/P/G | 6C, 6P, 6G | damp | cloudy | 1 |
| `8` + C/P/G | 8C, 8P | damp | cloudy | 1 |
| `10` + K/L | 10K, 10L | slippery | stretchy | 3 |
| `10DL` | 10DL | wet | none | 2 |
| `10SL` | 10SL K | wet | clear | 3 |
| `10WL` | 10WL K | wet | clear | 3 |
| `+C/K suffix` | 8C/K | damp | cloudy | 1 |
| `+K/L suffix` | 10K, 10L | slippery | clear | 3 |

### Simplification notes

- Our app collapses codes 6 and 8 (sticky/tacky) into `damp + cloudy`. Both map to rank 1.
- Code `4` (shiny without lubrication) is treated as `damp` in our system, also rank 1 if appearance is present, rank 0 if none.
- Lubricative (`L`) is mapped to `clear` appearance at rank 3, consistent with peak-type classification.
- The app does not expose the frequency codes (X1, X2, X3, AD) in MVP. This is a potential future enhancement for advanced users.

---

## 4. Sticker Color System

The official Creighton paper chart uses colored sticker stamps to visually mark each day. This is the system shown on the paper charts shared by practitioners (see the filled-out chart image in the project assets).

| Sticker | Color | Meaning |
|---|---|---|
| Red | Red | Bleeding day (H, M, L, VL, B) |
| Green | Green | Dry day (code 0) — low/no fertility |
| Green with baby | Green + baby icon | Dry day that falls within or near a fertile phase |
| White/grey | White or light grey | Mucus present (non-peak type: codes 6, 8) |
| Yellow | Yellow | Post-peak fertile days in official system |
| White baby | White + baby icon | Peak-type mucus day (code 10/10WL/10SL) |

### How this maps to the app (MVP)

The app uses **color-coded calendar cells** and a small **indicator dot** (in place of the baby sticker) in the top-right of the cell. The visual intent matches the paper system:

| App calendar color | Indicator | Equivalent sticker |
|---|---|---|
| Red cell | None | Red sticker (bleeding) |
| White cell | None | No entry logged |
| Green cell | None | Green sticker (dry, or post-peak) |
| Green cell | Green dot | Green baby sticker (non-peak mucus, rank 1–2) |
| White cell | Blue dot | White baby sticker (peak-type mucus, rank 3) |
| White cell | Blue dot + blue border | Confirmed Peak day |
| Yellow cell | None | Post-peak days (P+1, P+2, P+3) |
| Any cell | 🌹 (bottom-right) | Intercourse recorded |

**Display logic:** Indicator dots are determined by **mucus rank** regardless of phase label. Any day with mucus rank >= 1 shows a green dot (non-peak, rank 1-2) or blue dot (peak-type, rank 3), whether the day falls in the fertile window, post-peak, or dry phase. This ensures the calendar always reflects the actual observation, consistent with Creighton's non-peak vs peak-type distinction. The calendar renders past cycles correctly by using per-cycle results from the multi-cycle engine rather than the single flat `recalculateCycle()` output.

### Future feature: paper chart view

A future version of the app should offer an alternate view that renders the cycle in the traditional Creighton sticker stamp format. This would be useful when sharing charts with a NaPro physician or FertilityCare practitioner. This is **not in MVP scope** but should be designed with this in mind — the data model already captures everything needed to render it.

---

## 5. Fertility Instructions Reference

The following rules come directly from the official Creighton reference card. They are documented here for cross-reference against our rules engine logic.

### Days of fertility (for achieving pregnancy — TTC)

1. The menstrual flow
2. From the beginning of mucus until **3 full days past Peak**
3. 1 or 2 days of non-peak mucus **pre-Peak**
4. 3 or more days of non-peak mucus pre-Peak — **plus count 3**
5. Any single day of peak mucus — **plus count 3**
6. Any unusual bleeding — **plus count 3**

### Days of infertility (for avoiding pregnancy)

1. Dry days pre-Peak — end of day, alternate days
2. Dry days post-Peak (days 1–3) — end of day, alternate days
3. 4th dry day post-Peak — always end of day
4. Dry days post-Peak (after 4th day) — end of day, alternate days
5. Dry days post-Peak (after 5th day) — end of day, every day
6. Dry days on L, VL, or B days of bleeding — end of day, alternate days

### Essential sameness question

Practitioners ask users: **"Is today essentially the same as yesterday?"** — yes or no. This is used to determine whether a mucus pattern is continuing or changing. This question is not currently in the app's entry form but is flagged as a potential future addition.

### Special fertility instructions (for TTC — subfertility patients)

- Avoid genital contact until good mucus is present
- Use days of greatest quantity and quality and first two days afterward
- Record the amount of stretch in centimeters (1, 2, 3…)
- Record abdominal pain (AP), right abdominal pain (RAP), and left abdominal pain (LAP)

Note: These subfertility-specific fields are out of scope for MVP.

---

## 6. Practitioner Insights

These themes emerge from practitioner experience and are relevant to shaping in-app copy, help text, onboarding, and the overall user experience.

### Charting as a diagnostic tool

The chart is not just a pregnancy aid — it is a window into reproductive health. Patterns that appear on a chart can help identify:

- Endometriosis
- Hormonal imbalances (estrogen, progesterone, LH)
- Luteal phase defects (short post-peak phases)
- Abnormal bleeding patterns (brown spotting, long cycles)
- The impact of stress on the cycle

Charts can be taken to a NaPro Technology physician for deeper evaluation and targeted treatment — without suppressing the cycle with hormonal contraceptives.

### What users discover

- Dietary changes (reducing processed foods, anti-inflammatory diets) often clear up abnormal mucus patterns and brown spotting.
- Stress shows up clearly in charting — delayed ovulation, disrupted mucus patterns.
- Many women realize they have had an undiagnosed condition for years that charting made visible.

### Tone for the app

- Normalize what users see. Abnormal patterns are informative, not alarming.
- Frame the chart as a tool for self-knowledge, not a pass/fail test.
- Don't create anxiety around imperfect charts — the goal is observation, not perfection.
- Position the app as a starting point. A practitioner or physician can take it further.

---

## 7. Future Features

Features that are out of MVP scope but should be designed with forward compatibility in mind.

| Feature | Description | Data model impact |
|---|---|---|
| Paper chart export / sticker view | Render the cycle in the traditional Creighton sticker stamp grid, printable or shareable with a practitioner | No new data needed — current fields are sufficient |
| Double Peak notation | Some cycles have two apparent peak candidates; the official system has a specific notation for this | Would require a `doublePeak` flag on `CycleResult` |
| Essential sameness prompt | Add "Is today essentially the same as yesterday?" to the daily entry form as a practitioner-aligned cue | Would require a `sameness: boolean` field on `DailyEntry` |
| Observation frequency | Record how often the most fertile sign was seen (X1, X2, X3, AD) | Would require a `frequency` field on `DailyEntry` |
| Subfertility fields | Stretch measurement, abdominal pain (AP, RAP, LAP) for NaPro physician reporting | Significant schema additions — post-MVP only |
| NaPro practitioner sharing | Export chart in a format compatible with NaPro review workflows | Depends on paper chart view and practitioner tooling |

---

## 8. Compliance Notes

Because the Creighton Model is a trademarked and certified system, the app must be careful about how it describes itself.

### Disallowed in all user-facing copy

- "Official Creighton"
- "Certified Creighton"
- "FertilityCare System" (trademarked by CCLI)
- Any claim of affiliation with CCLI (Creighton Model FertilityCare System organization)
- Any claim of practitioner certification or endorsement

### Allowed

- "Observation-based charting"
- "Standardized fertility observation"
- References to observable signs (sensation, appearance, mucus quality)
- "Compatible with Creighton Model charting" — only if carefully qualified

### Internal identifiers vs user-facing labels

Phase labels like `peak_confirmed`, `p_plus_1`, `p_plus_2`, `p_plus_3`, `fertile_open`, `post_peak` are internal engine identifiers. The user-facing strings displayed in the app will be reviewed separately before launch to ensure they are appropriately neutral.

### Recommendation

Before launch, have a lawyer review any copy that references the Creighton method by name. The safest position for MVP is to describe the system behaviorally ("tracks mucus quality, identifies your fertile window based on observed signs") without naming the underlying method.
