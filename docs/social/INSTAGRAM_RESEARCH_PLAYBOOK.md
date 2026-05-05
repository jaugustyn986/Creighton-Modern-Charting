# Instagram Research Playbook

This playbook defines how the Well Within Instagram research agent studies successful posts, maintains memory, and turns inspiration into original content tests.

## Purpose

The research agent should help Well Within grow through consistent, thoughtful Instagram content. It should learn from the market, from our own posts, and from audience behavior without chasing every trend or compromising the app's calm, sincere voice.

Primary goals:

- Increase reach and views.
- Increase saves and shares.
- Increase profile visits and follows.
- Increase link-in-bio taps and App Store traffic.
- Build trust with women who want observation-based fertility charting.

## Research Cadence

Manual starting cadence:

- Run research when Jim asks, ideally 1-3 times per week.
- Review performance 24-72 hours after each post.
- Update memory after each meaningful research or performance run.

Future automation target:

- Daily research collection.
- Weekly draft queue proposal.
- Human approval before publishing.

## Operating Loop

Use this loop so the system stays strategic without wasting time or context:

1. **Research inspiration:** check the target accounts or one focused source set for current hooks, formats, visible metrics, visual systems, comments, and CTAs.
2. **Log raw observations:** add useful references to `INSTAGRAM_RESEARCH_LOG.md`. This is the working notebook for individual posts and visual examples.
3. **Promote durable learnings:** update `INSTAGRAM_MEMORY.md` only when a pattern repeats, changes a strategic bet, reveals useful audience language, or identifies a risk.
4. **Queue strategic drafts:** add or update `INSTAGRAM_DRAFT_QUEUE.md` with the post role, target metric, source pattern, and visual system.
5. **Create with art direction:** before generating assets, apply `well-within-social-creative-direction`; use references and a chosen visual system, not generic decoration.
6. **Preview exact assets:** show Jim the final images, caption, slide order, account, and timing before publishing.
7. **Publish only after approval:** use `instagram-organic-publishing` and publish only the approved final version.
8. **Measure and iterate:** after posting, update `INSTAGRAM_EXPERIMENT_LOG.md` at 24h, 72h, and 7d when metrics are available, then promote meaningful results back into memory.

Default content role check before creating a post:

- reach-first identity/trust
- educational charting
- community prompt
- trust/privacy
- product-light utility
- direct CTA

## Required Context

Before each run, read:

- `docs/social/INSTAGRAM_MEMORY.md`
- `docs/social/INSTAGRAM_RESEARCH_LOG.md`
- `docs/social/INSTAGRAM_EXPERIMENT_LOG.md`
- `docs/social/INSTAGRAM_DRAFT_QUEUE.md`
- `docs/INSTAGRAM_ORGANIC_POSTING_PLAYBOOK.md`
- `skills/fertility_charting_domain.md`
- `skills/ux_tone_well_within.md`

## Source Sets

Use one focused source set per run:

- Fertility charting and fertility awareness apps.
- Natural planning and fertility-awareness educators, with careful claim filtering.
- TTC community creators and educators.
- Women's health and cycle awareness accounts.
- Calm productivity or journaling apps with strong gentle positioning.
- Privacy-first health app content.
- High-performing carousel formats.
- High-performing Reel hooks in adjacent health/wellness spaces.

Do not copy exact posts. Extract the pattern beneath the post.

## What To Extract

For each useful reference, capture:

- Account or source:
- URL or identifier:
- Format: Reel, carousel, Story, static image.
- Hook:
- First-frame structure:
- Visual pattern:
- Visual system: creator note, journal ritual, charting moment, editorial carousel, founder/voice post, soft explainer, privacy/trust visual, or other.
- Caption structure:
- CTA:
- Emotional angle:
- Likely success driver:
- Fit for Well Within:
- Risks or mismatch:
- How to transform it:

## Pattern Scoring

Score patterns qualitatively:

- **High fit:** gentle, useful, observation-based, easy to adapt.
- **Medium fit:** promising but needs tone, claim, or visual changes.
- **Low fit:** interesting but too trend-driven, clinical, fear-based, or hard to produce.
- **Reject:** copied, misleading, off-brand, claim-risky, or spammy.

## Translation Rules

Convert market patterns into Well Within-safe ideas:

- Replace prediction language with observation language.
- Replace urgency or fear with clarity and support.
- Replace medical authority claims with product behavior: structured charting, privacy, exports, pattern recognition.
- Replace generic wellness language with concrete charting moments.
- Replace "get pregnant faster" with "chart more consistently" or "understand your cycle more clearly."
- Replace direct product pushes with value-first content when the goal is reach, trust, or follows.

## Content Pillars

Start with these pillars:

- **Reach-First Fertility Awareness:** shareable, non-salesy posts about cycle literacy, natural planning-adjacent education, and charting identity.
- **Chart With Clarity:** daily observations, consistency, cycle awareness.
- **No Guesswork:** rules-based interpretation, no predictions, no AI fertility claims.
- **Private By Design:** local-first data, optional backup, user-owned information.
- **Patterns Over Time:** cycle history, peak day range, changing patterns.
- **Gentle TTC Support:** calm encouragement without promising outcomes.
- **App Utility:** fast daily entry, exportable charts, clear visual history.

## Drafting Rules

Each draft should test one primary variable:

- concept
- audience angle
- format
- hook
- first frame
- visual style
- caption length
- CTA
- posting time

Do not change too many variables at once unless the post is exploratory and marked as such.

For visual posts, apply `well-within-social-creative-direction` before image generation or final export:

- choose the content job
- pull 3-5 visual references when possible
- select one visual system
- reject generic decorative cards or random ornamentation
- critique the preview before final assets are approved

## Stale Trend Rules

Mark a trend stale when:

- it repeatedly underperforms for Well Within
- it no longer appears common in current research
- it requires a tone that feels insincere
- it depends on music, memes, or platform features we cannot reproduce well
- it needs claims we cannot make

## Output Of A Research Run

Each run should update at least one of:

- `INSTAGRAM_RESEARCH_LOG.md`
- `INSTAGRAM_MEMORY.md`
- `INSTAGRAM_EXPERIMENT_LOG.md`
- `INSTAGRAM_DRAFT_QUEUE.md`

Then summarize:

- research focus
- patterns found
- research log entries added
- memory changes
- draft tests added
- one recommended next post
- what to measure

## Guardrails

- No automated publishing.
- No copied creative.
- No invented logo.
- No prediction, diagnosis, medical treatment, or pregnancy outcome claims.
- No fear, shame, or pressure.
- No proprietary method affiliation claims.
