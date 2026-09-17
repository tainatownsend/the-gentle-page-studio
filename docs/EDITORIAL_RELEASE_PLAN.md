# Gentle Page Editorial Release Plan

The Editorial North Star compiler stack is integrated into `main`. Product release is now gated by the acceptance of the first customer-ready journal, not by additional speculative layout implementation.

## Integrated release foundation

The release line includes the editorial output correctness work, design system, page archetypes and recipes, compound journal components, recomposition engine, Visual QA/self-healing, golden acceptance coverage, and the post-merge structured-persistence fixes from PR #106.

Current production baseline:

- `main`: `e9eea89710565a1b13fb08f9da39a1091247e1b4`
- PR #99: merged
- PR #106: merged

## Current release gate

The first **ADHD Emotional Regulation Journal** must pass real-product acceptance as both a static and fillable PDF.

The acceptance sequence is:

1. generate from the current production path;
2. review the complete publication without page-by-page manual layout work;
3. export static PDF;
4. export fillable PDF;
5. test representative interactive fields in a real PDF viewer;
6. save, close, reopen, and verify values persist;
7. resolve only reproducible release-blocking defects;
8. approve the final customer files;
9. prepare listing assets, description, pricing, and sellable package;
10. publish the first real listing.

## Release rule

Do not restart broad layout tuning because a page could be subjectively different. Promote a new code change only when final-product acceptance exposes a concrete, reproducible failure against the North Star criteria.

## Done when

A customer-ready printable and fillable ADHD Emotional Regulation Journal is packaged, listed, and able to accept a purchase.

## North Star

**Paste / Upload → Compile → Beautiful publication → Preview → Export**

Manual layout intervention is an exception path, not part of normal publication creation.
