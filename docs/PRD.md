# Holistic Cycle – Product Requirements Document (MVP)

Version: 1.0  
Status: Draft  
Scope: MVP (Trying-to-Conceive Charting Only)

---

## 1. Product Vision

Holistic Cycle is a modern mobile application designed to help couples chart fertility observations and understand their fertile window while trying to conceive.

The application digitizes standardized fertility observation practices while maintaining strict deterministic interpretation rules.

The MVP focuses on:

- Accurate daily observation charting
- Deterministic interpretation of fertility signals
- Clear visualization of the fertile window
- Privacy-first architecture

The system intentionally avoids predictive fertility algorithms and relies exclusively on observed data.

## 2. Target User

**Primary user**

Women actively trying to conceive who are charting fertility observations daily.

**Secondary user**

Partner/spouse who may also view cycle progress.

## 3. Core MVP Features

The MVP includes the following core features:

- Calendar View
- Daily Observation Entry
- Cycle Chart Visualization
- Deterministic Fertility Rules Engine
- Cycle Phase Labeling
- Local Data Persistence
- Basic Account System (optional for MVP)

## 4. Feature Specifications

### Feature: Calendar View

**User Story**  
As a user charting my cycle, I want to view my cycle using a calendar interface so that I can easily navigate between days and enter observations for the correct date.

**Requirement**

The application shall provide a calendar screen that allows users to:

- View the current month by default
- Navigate to previous months
- Navigate to future months
- Select any day within the calendar
- See a visual indicator for days that already contain chart data
- See a visual indicator for fertile window days (once computed)

**Calendar behavior**

When a user taps a day:

- The app navigates to the Daily Entry screen for that date.

**Calendar indicators**

Days may display the following states:

- No entry
- Entry exists
- Fertile window day
- Peak day
- Post-peak day

### Feature: Calendar View — Enter Daily Charting Data

**User Story**  
As a user charting my cycle, I want to easily enter daily observations so that I can build an accurate record of my fertility signs.

**Requirement**

Users must be able to enter chart data through a form.

The form may be accessed through:

- Selecting a day from the calendar
- Selecting a floating "Add Entry" button

The data entry interface must contain the following fields.

**Required fields**

- **Observation date**  
  - Automatically populated from calendar selection

- **Bleeding type**  
  - Allowed values: none, spotting, light, moderate, heavy

- **Sensation**  
  - Allowed values: dry, damp, wet, slippery

- **Appearance**  
  - Allowed values: none, cloudy, clear, stretchy

- **Quantity**  
  - Allowed values: none, low, medium, high

**Optional fields**

- **Intercourse** — Values: yes, no
- **Notes** — Free text

**Behavior**

When the user saves the entry:

- Entry is stored locally
- Rules engine is executed
- Cycle interpretation is recalculated
- Calendar and chart views update automatically

### Feature: Cycle Chart Visualization

**User Story**  
As a user tracking fertility observations, I want to view a visual chart of my cycle so that I can understand trends and patterns over time.

**Requirement**

The application must provide a chart view displaying daily observations across the cycle.

The chart must show:

- Each day in the cycle
- Mucus ranking for each day
- Fertile window
- Peak day
- Post-peak days

**Chart elements**

- **X-axis:** Cycle day
- **Y-axis:** Mucus rank

**Rank scale**

- 0 — Dry
- 1 — Damp
- 2 — Wet
- 3 — Peak quality

**Visual indicators**

- Peak day should be visually highlighted.

### Feature: Deterministic Fertility Rules Engine

**User Story**  
As a user charting fertility observations, I want the system to interpret my chart using consistent rules so that I can clearly understand when my fertile window occurs.

**Requirement**

The system must include a deterministic rules engine.

The rules engine must:

- Accept a list of daily observations
- Compute a fertility interpretation
- Return phase labels for each day

The rules engine must not:

- Predict ovulation
- Use probabilistic models
- Use machine learning

All outputs must derive strictly from observed data.

#### Rules Engine Input Data Structure

Each cycle is represented as a list of daily entries.

**DailyEntry fields**

- date
- bleedingType
- sensation
- appearance
- quantity
- intercourse
- missing

Missing days must be supported.

#### Rules Engine Step 1 — Mucus Ranking

Each day must be converted to a numeric mucus rank.

**Ranking logic**

- **Rank 0** — Condition: sensation = dry AND appearance = none
- **Rank 1** — Condition: sensation = damp
- **Rank 2** — Condition: sensation = wet
- **Rank 3** — Condition: any of sensation = slippery, appearance = clear, appearance = stretchy

**Rank precedence**

- If multiple signals exist, the highest rank applies.  
  - Example: wet sensation + clear appearance → Rank 3

#### Rules Engine Step 2 — Fertile Window Start

The fertile window begins at the first day where mucusRank ≥ 1.

**Algorithm**

- Iterate through entries.
- If rank ≥ 1: fertileStartIndex = current index.
- If no such day exists: fertile window does not open.

#### Rules Engine Step 3 — Peak Identification

Peak day is defined as the last day of highest quality mucus before a sustained decline.

**Candidate rule**

- Any day where mucusRank = 3.

**Confirmation rule**

- Peak is confirmed only if the following three days exist and each satisfy: rank < candidateRank.

Example:

- Day 4 → rank 3, Day 5 → rank 1, Day 6 → rank 0, Day 7 → rank 0 → Peak = Day 4

**Peak Reset Rule**

- If a candidate peak is followed by a day with equal or higher rank before confirmation is complete, the candidate peak is replaced.  
  - Example: Day 4 → rank 3, Day 5 → rank 1, Day 6 → rank 3 → New candidate peak = Day 6

**Missing Day Rule**

- If any of the confirmation days (P+1, P+2, P+3) are missing: peak cannot be confirmed; peak remains unconfirmed.

#### Rules Engine Step 4 — Fertile Window End

- Fertile window ends on: Peak + 3.  
  - Example: Peak = Day 10 → Fertile window end = Day 13

#### Phase Labels

Each day receives a phase label.

Possible labels:

- dry
- fertile_open
- peak_confirmed
- p_plus_1
- p_plus_2
- p_plus_3
- post_peak
- fertile_unconfirmed_peak

#### Rules Engine Recalculation Requirement

The entire cycle must be recalculated whenever:

- a day is added
- a day is edited
- a day is deleted

No incremental state may be stored.

**Verification and tests:** Canonical verification examples and test-automation requirements (e.g. 100% coverage) are defined in [RULES_ENGINE_SPEC.md](RULES_ENGINE_SPEC.md#rules-engine-verification-examples). Each example must correspond to a unit test.

### Feature: Cycle Recalculation

**User Story**

As a user editing past observations, I want the system to automatically recompute my cycle interpretation so that my chart remains accurate.

**Requirement**

Any modification to entries must trigger a full recalculation of:

- mucus ranking
- fertile window
- peak detection
- phase labels

### Feature: Data Storage

**User Story**

As a user charting my cycle, I want my data saved securely so that my history is preserved.

**Requirement**

**MVP storage strategy**

- Local device storage.

Possible implementation: SQLite, AsyncStorage.

**Future phase**

- Cloud sync.

### Feature: Privacy and Security

**User Story**

As a user entering sensitive reproductive data, I want assurance that my data remains private.

**Requirement**

The application must:

- Avoid third-party analytics
- Avoid advertising SDKs
- Avoid external fertility APIs

All cycle data must remain user-owned.

## MVP Success Metrics

Success will be measured through:

- Daily active charting users
- Entry completion rate
- Retention after 30 days

## Out of Scope (MVP)

The following are not included in the MVP:

- Pregnancy tracking
- Practitioner communication
- AI fertility guidance
- Couple accounts
- Hormone integration
- Apple Health integration

---

## Engineering Trim (Existing)

### MVP Goals

- Cloud-first, iOS-first Expo app.
- Deterministic Creighton rules engine (TTC-only).
- Partner read-only sharing.
- Subscription via RevenueCat.
- Privacy-first (no ad SDKs).

### MVP Must-Haves

- Daily entry structure: bleeding, ESQ (sensation/appearance/quantity), intercourse boolean, notes.
- Deterministic mucus rank (0-3) function.
- Peak detection algorithm: candidate + confirmation after 3 lower-quality days.
- Fertile window starts first mucus day after bleeding, ends at P+3 inclusive.
- Recompute entire cycle on any edit.
- Unit tests covering edge cases.
- Minimal Expo app demonstrating daily entry UI + timeline + partner view stub.
- CLI runner for validating engine behavior with JSON fixtures.

### Non-goals

- No AI assistant.
- No predictive scoring.
- No Android for MVP.
