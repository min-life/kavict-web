# Learning Module Board Design

## Goal

Replace the `/dashboard/learning` lesson carousel with a progressive finance-learning module board. Learners choose a module first, then see that module's lessons, assessment, and Premium-gated content.

## Routes and navigation

- `/dashboard/learning` is the module-board entry route. It renders a responsive grid, with Module 1 first.
- `/dashboard/learning/module/[id]` renders the selected module's lesson list and final module test.
- Existing lesson URLs remain `/dashboard/learning/lesson/[id]`.
- A Premium item routes directly to `/dashboard/upgrade` for an unsubscribed learner.
- Invalid or absent lesson IDs fall back to lesson `1`, never lesson `4`.

## Module board

Each card contains the module number, title, short outcome, one or two topic tags, and a one-to-five-star difficulty indicator in its top corner. Cards are interactive only for published modules. Future modules retain their cards but display `Nền tảng sẽ update sớm` rather than exposing content.

Published curriculum:

| Module | Title | Topics | Difficulty |
| --- | --- | --- | --- |
| 1 | Nền tảng dòng tiền | Ngân sách, Tiết kiệm | 1 star |
| 2 | Lá chắn tài chính | An toàn, Bảo hiểm | 2 stars |
| 3 | Khởi đầu đầu tư | Đầu tư, Tích sản | 3 stars |
| 4 | Tài sản số & danh mục | Tài sản số, Quản trị | 4 stars |
| 5+ | Nền tảng sẽ update sớm | Module tương lai | 5 stars |

## Module detail

The detail page presents an ordered learning path: lessons first, then one final module test. Each item exposes its title, concise description, type, duration or XP where available, and access state.

- Free lessons and module tests navigate to the existing lesson detail route.
- Premium lessons are visibly disabled for a free account: muted gray surface, blue `star` icon, and the label `Premium`.
- Selecting an unavailable Premium lesson navigates to `/dashboard/upgrade`; it must not pretend that the lesson has opened.
- The page supplies a clear back action to the module board.

## Data boundaries

The module catalog is display/navigation data owned by the learning UI. Existing lesson content and `LearningRepository` persistence remain unchanged. The implementation should centralize module metadata so the board and module-detail route use the same titles, tags, difficulty, item order, and Premium state.

## Error handling

- Unknown module IDs render a safe not-found-style state with an action back to `/dashboard/learning`.
- Existing unknown lesson IDs use lesson 1 as their safe fallback.
- Future module cards never link to a nonexistent module detail route.

## Verification

- Automated tests assert the board module order, the Module 1 entry behavior, the Premium upgrade destination, and the lesson fallback.
- Run targeted tests, the full Vitest suite, TypeScript checking, linting, and production build before completion.
