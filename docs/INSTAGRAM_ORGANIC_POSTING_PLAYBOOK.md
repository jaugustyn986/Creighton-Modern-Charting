# Instagram Organic Posting Playbook

This playbook documents the Well Within Instagram posting workflow after the first Composio-assisted publishing run.

For research, memory, and draft strategy, use:

- `docs/social/INSTAGRAM_RESEARCH_PLAYBOOK.md`
- `docs/social/INSTAGRAM_MEMORY.md`
- `docs/social/INSTAGRAM_RESEARCH_LOG.md`
- `docs/social/INSTAGRAM_EXPERIMENT_LOG.md`
- `docs/social/INSTAGRAM_DRAFT_QUEUE.md`

For visual quality and art direction, use `C:\Users\JimAugustyn\.cursor\skills\well-within-social-creative-direction\SKILL.md` before generating or exporting social assets.

## Current Setup

- Instagram account: `@wellwithinapp`
- Instagram Business ID: `35505027615807331`
- App Store URL: `https://apps.apple.com/us/app/id6760519448`
- Publishing path: Composio Instagram toolkit, using Instagram Graph API media containers.
- Primary CTA path: link in bio. Feed caption URLs are not clickable.

## What Happened

We tested three publishing-related paths:

1. A carousel was prepared manually for Instagram.
2. A single organic feed image was generated and published through Composio.
3. The first generated feed image used a lookalike/generated logo, which was wrong. We corrected the process, created a replacement with the actual app icon, and published the replacement.

Recent verified posts:

- Corrected feed image: `https://www.instagram.com/p/DX7j0upFOpv/`
- Earlier carousel: `https://www.instagram.com/p/DX3AqJ_DVL2/`

## Key Lessons

### Brand Assets

- Never ask an image generator to recreate the Well Within logo.
- If the logo appears, composite the real app icon asset from `apps/mobile/assets/icon-1024.png`.
- If the exact asset is unavailable, omit the logo instead of approximating it.
- For remote publishing, use the local app icon when building locally, or the App Store-hosted icon only when a remote Composio workflow cannot access local files.
- Always visually preview the final image in chat before approval.

### Image Formatting

Default feed image:

- Size: `1080 x 1350`
- Aspect ratio: `4:5`
- Format for design: PNG or JPG
- Format for Composio/Instagram publishing: prefer JPEG
- Keep important text centered with safe margins.
- Use large, readable text. Avoid dense copy baked into the image.

Default carousel:

- Size: `1080 x 1350` per slide
- Aspect ratio: consistent across slides
- Items: 2-10
- API constraints often require JPEG, direct/public media, and an aspect ratio between 4:5 and 1.91:1.

Stories/Reels:

- Size: `1080 x 1920`
- Aspect ratio: `9:16`
- Keep text away from top and bottom app UI areas.
- Story link stickers are manual unless the publishing tool explicitly supports them.

## Recommended Posting Workflow

If the post is not already chosen, run the research workflow first:

1. Read `docs/social/INSTAGRAM_MEMORY.md`.
2. Review `docs/social/INSTAGRAM_DRAFT_QUEUE.md`.
3. Choose a draft that maps to a current strategic bet and target metric.
4. Move into the posting workflow below only after the concept is selected.

1. Choose the post goal.
   - Reach: Reel.
   - Education/saves: carousel.
   - Traffic/CTA: Story with link sticker or feed post pointing to link in bio.
   - Simple positioning: single feed image.

2. Draft the creative.
   - Keep one concept per post.
   - Use Well Within language: calm, observational, privacy-first.
   - Avoid prediction, diagnosis, or fertility outcome claims.

3. Build the visual.
   - Apply the social creative-direction workflow first: define the content job, pull references when possible, select one visual system, and critique the preview.
   - Prefer real-world charting context, editorial layouts, real app UI, or meaningful lifestyle imagery over generic decorative cards.
   - Prefer deterministic layout/compositing for brand-heavy assets.
   - Use generated imagery only when it convincingly supports the selected visual system.
   - Composite the real app icon if a logo is needed.

4. Validate the asset.
   - Confirm dimensions.
   - Confirm file type.
   - Confirm text is readable on mobile.
   - Confirm logo is exact or omitted.
   - Confirm there is no private health data or unsupported UI.

5. Preview before approval.
   - Display the final image in chat.
   - Provide caption, hashtags, CTA, account, format, slide order, final asset paths, and publish timing.
   - Ask for explicit approval.

6. Publish through Composio.
   - Confirm the account with `INSTAGRAM_GET_USER_INFO`.
   - Check quota with `INSTAGRAM_GET_IG_USER_CONTENT_PUBLISHING_LIMIT`.
   - Create the media container.
   - Publish the container.
   - Fetch the permalink with `INSTAGRAM_GET_IG_MEDIA`.

7. Record follow-up.
   - Capture permalink, publish time, concept, format, CTA, and target metric.
   - Add or update the entry in `docs/social/INSTAGRAM_EXPERIMENT_LOG.md`.
   - Review performance at 24h, 72h, and 7d when metrics are available.

## Efficient Creative Workflow

Use this shorter path for future posts:

1. **Pick the role first.** Confirm whether the post is reach-first, educational, community prompt, trust/privacy, product-light, or direct CTA.
2. **Create one direction preview.** Use a contact sheet or rough carousel preview to test mood, visual system, and slide flow before producing final assets.
3. **Separate direction approval from publish approval.** Direction approval means "make final assets"; publish approval means "post this exact version."
4. **Generate background plates without text when useful.** Overlay final text deterministically so typography stays crisp and consistent.
5. **Export once.** After direction approval, create exact `1080 x 1350` JPGs in a named folder and preview those final slides in chat.
6. **Stage only approved JPGs.** Upload or host the final JPGs only after approval, then verify each staged URL or file object before creating the Instagram container.
7. **Publish and log immediately.** After publishing, verify the permalink and update `INSTAGRAM_EXPERIMENT_LOG.md`.

Default folder pattern:

```text
docs/social/generated/[post-slug]/
```

Use a suffix only when comparing active alternatives, such as `[post-slug]-direction-a` and `[post-slug]-direction-b`. Delete rejected exploratory folders when the direction is chosen.

## Retro: First Reach-First Carousel

Post: `https://www.instagram.com/p/DX9kmz9lG1a/`

What slowed us down:

- We made finished-looking slides too early, before the visual direction was settled.
- Early versions used decorative shapes and generic card layouts that did not feel like a real fertility-awareness creator account.
- The approved preview and final exported slides drifted more than ideal because the preview was generated as a composed mockup, then final slides were rebuilt separately.
- Local files required a staging step before Instagram could ingest them.

What worked:

- The creative-direction skill caught the generic-card problem and moved the post toward a real-world journal/ritual visual system.
- Direction approval before final publish prevented posting weaker versions.
- Final text overlay outside the image generator produced sharper, more controllable typography.
- Verifying direct image URLs before container creation avoided Instagram fetch/format errors.

Next-time improvements:

- Start with 3-5 visual references or a clear visual system before generating any image.
- Make the first preview a direction board, not export-ready art.
- Once a direction is approved, either use that exact image source for final slides or explicitly tell Jim what changed.
- Prefer reusable background plates and deterministic text overlays for carousels.
- Keep final assets, caption, slide order, and publish approval in one checklist before live posting.

## Composio Constraints

- Composio cannot directly publish a local Windows file path.
- Use a Composio file upload object or a direct public HTTPS image URL. Verify staged image URLs return `200 OK` and `image/jpeg` before container creation.
- Container creation and publishing are separate steps.
- Container IDs can expire; do not create them long before publishing.
- Scheduling is not native in this workflow. If scheduling is needed, use Meta Business Suite manually or build a scheduler that creates/publishes near the target time.
- Deleting published Instagram media may not be available through the current Composio tools. In our test, an API delete attempt failed with an unsupported delete request, so manual deletion in Instagram may be required.

## Approval Template

```markdown
Ready to publish to @wellwithinapp?

Format:
Image:
Logo source:
Caption:
Hashtags:
CTA:
Publish timing:
Target metric:

Reply "approved to publish" and I will publish exactly this version.
```

## Caption Defaults

Use Hook -> Value -> CTA.

Example:

```text
Your cycle is giving you signs. Charting helps you notice them.

Well Within is built for observation-based fertility charting: a calmer way to record daily signs, recognize patterns, and understand your cycle without relying on guesswork.

If you're trying to chart more consistently, download Well Within from the link in bio.

#FertilityCharting #CycleAwareness #TTCCommunity #FertilityAwareness #WomensHealth #CycleTracking
```

## Rollback Plan

Before publishing, assume deletion may be manual.

If something goes wrong:

1. Stop creating new containers.
2. Capture the post permalink and media ID.
3. Try supported Composio/Instagram delete tools only if available.
4. If unsupported, delete manually in Instagram.
5. Create a corrected replacement only after the incorrect post is removed or the user explicitly approves a replacement anyway.

## Next Improvements

- Create a reusable local script for deterministic social images that always composites `apps/mobile/assets/icon-1024.png`.
- Keep a small library of approved post templates: quote post, carousel, app demo, privacy post, Story CTA.
- Add a lightweight social log with permalink, concept, asset source, caption, and metrics.
- Build a scheduler only after the publish-now workflow is stable.
