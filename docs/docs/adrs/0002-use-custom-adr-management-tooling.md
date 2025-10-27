# ADR-0002: Use custom ADR management tooling

Date: 2023-01-10

## Status

Accepted

Amends [ADR-0001: Record architecture decisions](0001-record-architecture-decisions.md)

Superseded by [ADR-0010: Move ADRs to the main repository and documentation site](0010-move-adrs-to-the-main-repository-and-documentation-site.md)

## Context
<!-- The issue motivating this decision, and any context that influences or constrains the decision. -->

Management of ADRs in a way where it's easy to maintain but also consistently formatted requires tooling.

There are several tooling solutions that exist, most prominently [`adr-tools`](https://github.com/npryce/adr-tools/).

However, the tooling consists of many files and is not easily integrated into a project. Additionally, it doesn't provide out-of-the-box support for Windows users.

In addition, we prefer to have ADR names / IDs prefixed with `ADR-` to make it easier to distinguish them from other documents.

## Decision
<!-- The change that we're proposing or have agreed to implement. -->

We will save our ADRs in the `<repo root>/docs/adrs` folder.

We will name our ADRs `<number>-<title>.md`, where `<number>` is a sequential number (padded with zeros to be four digits long) and `<title>` is a short, kebab-case title.

We will use the following format for ADRs (additional sections may be added as needed):

```markdown
# ADR-<number>: <title>

Date: YYYY-MM-DD

## Status

<Proposed | Accepted | Deprecated>

<for each link:>
<Superseded by | Supersedes | Related to | Amends | Amended by | ...> [ADR-<number>: <title>](<filename>.md)

<end>

Superseded by [ADR-0010: Move ADRs to the main repository and documentation site](0010-move-adrs-to-the-main-repository-and-documentation-site.md)

## Context

[...]

## Decision

[...]

## Consequences
    
[...]
```

We will add our own shell script for managing ADRs to the project that will provide the following functionality:

- `adr new <title>`: Create a new ADR with the given title.
- `adr new --supersedes <adr-number> <title>`: Create a new ADR with the given title and supersede the given ADR.
- `adr link <adr1-number> <adr1-prefix> <adr2-number> <adr2-prefix>`: Create a link between two ADRs in the schema `<adr1-number>` `<adr1-prefix>` `<adr2-number>` (e.g., `ADR0001` `Amends` `ADR0002`), and `<adr2-number>` `<adr2-prefix>` `<adr1-number>` (e.g., `ADR0002` (is) `Amended by` `ADR0001`). This will create a link in both ADRs with according notes.
- `adr accept <adr-number>`: Mark the ADR with the given number as accepted.

We will write the script in a POSIX-compliant shell script, and will provide a Windows batch file that will call the shell script.

We will exclusively use the script to manage ADRs, and will not use the `adr-tools` tooling.

## Consequences
<!-- What becomes easier or more difficult to do and any risks introduced by the change that will need to be mitigated. -->

We will have to maintain our own tooling, but it will be easier to integrate into the project.

The formatting will be perfectly fitted to our wishes.

