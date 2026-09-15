# Smart Pagination v2 Acceptance Focus

Validate this stacked PR after PR0029 compiler behavior is already understood.

1. Compile a manuscript with at least two response fields using different response sizes.
2. Confirm Preview gives writing fields visibly different minimum sizes and uses spare page space instead of leaving avoidable dead space.
3. Edit a response block and change Response size between Short, Medium, and Long; save and confirm Preview responds.
4. Change Page placement between Auto, Prefer new page, and Start new page; confirm the next Preview follows the semantic intent without storing manual page numbers.
5. Use a manuscript with an intentionally oversized paragraph and confirm Preview shows a non-blocking “Layout review suggested” notice while export actions remain available.
6. Download a fillable PDF and confirm response-field geometry broadly matches the browser Preview because both consume the same smart allocation plan.
7. Confirm normal manuscripts with no unresolved geometry do not show a layout warning.

This PR is successful when automatic geometry handles the common case and the user only needs semantic corrections for exceptions.
