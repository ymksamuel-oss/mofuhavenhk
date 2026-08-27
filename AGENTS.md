# Mofu Haven HK — Version-control workflow

## Automatic commits

After completing each coherent user-requested change to code, catalogue data, documentation, configuration, or tests, validate the relevant change and create a local Git commit automatically. The user has granted standing authorization for these local commits, so do not request confirmation before committing. Use a concise Conventional Commit-style message such as `fix: restore cart button binding` or `docs: update product verification sources`.

Do not create empty commits. Group only closely related edits in the same commit, and inspect `git status` and `git diff --cached` before committing.

## Safety controls

Never add or commit secrets, access tokens, passwords, private keys, `.env*` files, build artefacts, dependency folders, downloaded archives, temporary exports, or generated runtime files. Do not use `git add -A` or `git add .`; stage only the specific reviewed paths. Preserve the existing `.gitignore` and add exclusions when a new generated or sensitive local artefact appears.

Commits are local by default. Do not push, force-push, rewrite history, merge branches, open pull requests, or change repository visibility unless the user explicitly asks for that action. Before any remote write, report the target branch and the commits intended for publication.

## Checks and reporting

Run the smallest relevant validation before committing. If a required check fails, do not commit the failed implementation as complete; report the failure and commit only an explicitly approved checkpoint when appropriate. After each commit, report the short commit hash, message, changed paths, validation performed, and whether the change remains local or has been published.
