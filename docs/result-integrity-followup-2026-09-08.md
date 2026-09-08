# Supply result integrity follow-up — September 8, 2026

Baseline: main `3ed427ae3ad7a06ac1d88444c0f0af3701bbd77a`; production deployment `dpl_6M4J3vBMVCwMXN155nzFNgWxDw2t`.

Additional defects remained after the earlier audit:

- Editing a supplier product could replace missing cost with zero. Missing manufacturer was also replaced with the supplier name. Unknown inputs now remain unknown.
- Opportunity/account aggregates treated individual missing amounts as zero. Totals now remain unavailable when any included record lacks a valid amount. Explicit zero is preserved.
- Hardware line profit could imply full margin with a missing cost or unverified quantity. Both amounts and a verified quantity are required.
- Order display converted a missing total into zero and could discard a real zero. It now retains unknown values and explicit zero correctly. Loading does not display provisional zero metrics.
- Pricing helpers reject whitespace, booleans, arrays, nonfinite and invalid values. Error/loading states distinguish missing data from a successfully loaded empty result.

Validation: all six pricing tests passed, including incomplete totals, explicit zero, invalid inputs and hardware profit cases. Production build passed. These checks do not establish a deployed fix or verified supplier prices. No catalog price, stock quantity, supplier quote or commercial order was invented or issued.

Release follow-up: inspect PR checks and deployment, then verify authenticated account/admin/supplier workflows and incomplete data on the deployed revision. Continue review of existing default/seed records; the earlier audit is not a blanket certification that all stored values are verified.
