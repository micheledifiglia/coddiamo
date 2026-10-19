# QA report — Marea

Date: 2026-10-19  
Scope: published PWA, primary navigation, quick search, browser console/network, PWA assets, and narrow mobile layout.

## Results

- One low-severity issue found: with English selected, quick-search section titles were English while all seven descriptions stayed Italian.
- The descriptions are now translated in English, Spanish, French, and German. Italian remains the source language.
- Main routes (overview, programmes, universities, shortlist, compare, applications, dossier) loaded without console errors.
- Manifest, service worker, Marea icon, and favicon returned successfully; install branding reports Marea.
- At 375 px width, the tested page had no horizontal overflow. Search for Utrecht returned the expected programme.
- Automated checks: 52 tests pass; production Sites worker build succeeds.

## Issue 001

- Severity: low (localization)
- Reproduction: set the app language to English, open Quick search, and inspect the descriptions under the section buttons.
- Before: English labels with Italian descriptions such as “La tua home · riepilogo e classifiche”.
- Fix: added reversible translations for every quick-search description in `master-atlas-2027/dist/i18n.js`.
- Regression coverage: `master-atlas-2027/tests/i18n.regression-1.test.cjs`.
- Status: fixed; regression test and full test suite pass.

## Health score

Qualitative score for this audit: 95/100 before the fix (one low-severity issue), 100/100 after. This is a QA heuristic, not a production reliability metric.

## Deferred issues

None found in the tested scope.
