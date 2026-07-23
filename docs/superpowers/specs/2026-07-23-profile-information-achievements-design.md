# Profile information and achievements design

## Purpose

Replace the single mixed profile dashboard with two in-page tabs at
`/dashboard/profile`: **My Information** and **My Achievement**. The page keeps
the existing route, semantic theme tokens, and responsive card style.

## Page structure

The page header contains two accessible tab buttons. **My Information** is the
initial tab; switching tabs replaces only the tab panel and does not navigate
away from the page.

### My Information

The information tab contains:

- A profile avatar section. It is empty until the user selects one of six
  original, locally defined, playful illustrated character avatars. There is no
  file upload control and no dependency on third-party image URLs.
- A **Basic Information** card showing name, age, email, and platform join
  date. Values unavailable from the current account show a clear placeholder.
- A **Personalization** card with a free-text field for what Kavi should know,
  four selectable tones (Vui vẻ, Nghiêm túc, Ấm áp, Giận dữ), and two answer
  length choices (Ngắn gọn - vào trọng điểm; Dài hơn - chi tiết hơn).
- An explicit save action with loading and error feedback.

### My Achievement

The achievements tab contains:

- A three-stat overview for total XP, Kavi coin, and learning streak.
- A **Huy hiệu đã đạt được** card.
- A **Học tập** card for completed modules, tests taken, notes created, and
  flashcards reviewed.
- A **Quản lý tài chính** card for active goals, tracked expense days, saving
  progress, and budget challenges completed.
- A **Practice Space** card for practice sessions, challenges completed, best
  score, and earned XP.

Until these metrics have live repositories, the card values remain clearly
presented sample statistics, matching the current profile page convention.

## Persistence and boundaries

Extend the existing auth profile contract with avatar and personalization
fields, plus a profile update operation. The local auth adapter writes them to
the existing `kavict:local:profile` record. The Firebase adapter merges the
same fields into `users/{uid}` in Firestore. This does not add a server,
Firebase Storage, or an upload pipeline.

The avatar is stored as a small `avatarKey`, not an image blob or remote URL.
The UI maps that key to its local character illustration. Both adapters notify
subscribers after saving so the screen updates immediately.

## Error handling and accessibility

The save button is disabled while saving. A failed save leaves the form data in
place and exposes an inline Vietnamese error message. Tabs use `role=tablist`,
`role=tab`, and `aria-selected`; character choices are keyboard-reachable
buttons with descriptive labels.

## Verification

- Unit tests cover local profile persistence and update notifications.
- Type checking and linting cover the route and auth-contract updates.
- A browser check verifies initial tab selection, tab switching, character
  selection, personalization save, and persistence after reload in local mode.
