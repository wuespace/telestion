# ADR-0010: Move ADRs to the main repository and documentation site

Date: 2025-10-26

## Status

Accepted

Supersedes [ADR-0002: Use custom ADR management tooling](0002-use-custom-adr-management-tooling.md)

## Context
<!-- The issue that is motivating this decision and any context that influences or constrains the decision. -->

All repositories of the project apart from the `telestion-architecture` repository have been migrated to a monorepo structure. The ADRs were originally placed in a separate repository to keep them decoupled from the codebase. However, with the move to a monorepo, it is more practical to have the ADRs located within the main repository itself.

With the integration into the bigger repository, the tooling used to manage ADRs in the separate repository is no longer viable, since it was tailored specifically for that repository structure.

## Decision
<!-- The change that we're proposing or have agreed to implement. -->

We will move the ADRs to the documentation site in the main repository. This will centralize all project documentation and make it easier for contributors to find and reference the ADRs. The ADRs will therefore be available at <https://docs.telestion.wuespace.de/adrs/>.

We will discontinue the use of the custom ADR management tooling previously employed in the separate repository. Instead, we will manage ADRs manually using standard version control practices. This includes creating new ADRs as markdown files, updating existing ones as needed, and tracking changes through commit history.

We will archive the old ADR repository to preserve its history, but it will no longer be actively maintained.

In the old ADR repository, we will update the `README.md` file to inform users about the new location of the ADRs and provide a link to the new location in the main repository.

## Consequences
<!-- What becomes easier, or more difficult to do and any risks introduced by the change that will need to be mitigated? -->

Since we no longer have the automated tooling for managing ADRs, we will need to handle the creation, updating, and tracking of ADRs manually. This may introduce some overhead in maintaining the ADRs, but requires less maintenance in the long run compared to maintaining custom tooling.

Old links will need to be updated to point to the new location of the ADRs in the main repository. This may require some effort to ensure that all references are correctly updated.
