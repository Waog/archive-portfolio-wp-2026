## General

This is an archived website of a former portfolio of Oliver Stadie - Software Engineer • Game Developer • Software Architect and Designer • Generalist.

This website, which was originally written in WordPress, then the hosted version was scraped via HTTrack, and now the scraped code resides in this repository. Thus, the code is not very clean and may contain a lot of redundant and unused code. Don't mind about this and just keep the messy code as it is. No need to clean up.

Still, when applying changes, remember that there might be a lot of redundant places which might need your changes. Ensure you fix _all_ affected files.

Write all source code in English, regardless of our chat language.

When you are in agent mode: don't explain things to me nor tell me what to do, unless I explicitly ask for advice or explanation. Instead, just finish implementing what I asked for; I want finished code and a working feature.

Prefer minimal changes over large refactors, unless the code is very bad or you are asked to do a refactor. If you think a refactor is necessary, explain why and ask for confirmation before proceeding.

Prefer using libraries and reusing existing code over writing new code. Suggest new libraries instead of reinventing the wheel. Brief and non-duplicated code is always more maintainable and preferred.

## For Code Review: Legal consistency (mandatory)

This repository uses `legal/legal-project-facts.data.ts` and `legal/legal-project-conclusions.data.ts` as the single source of truth for all legal-relevant facts.

When reviewing pull requests:

- check whether code changes introduce or modify legally relevant functionality (e.g. forms, tracking, third-party services, authentication, payments, notifications)
- if so, verify that the Legal Project Facts Data (`legal/legal-project-facts.data.ts`) was updated to reflect the change
- if the Legal Project Facts Data (`legal/legal-project-facts.data.ts`) changed, verify that the Legal Project Conclusions Data (`legal/legal-project-conclusions.data.ts`) and the files in `docs/oliverstadie.com/impressum/index.html` and `docs/oliverstadie.com/datenschutz/index.html` were updated accordingly
- it is valid that no change is required, but that outcome must be explicitly justified
