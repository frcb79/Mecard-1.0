**Branch protection recommendations**

Follow these steps in the GitHub repository settings (requires admin rights):

1. Go to Settings → Branches → Add rule.
2. For `Branch name pattern` set `main` (and create a separate rule for `staging`).
3. Enable these settings:
   - Require pull request reviews before merging (set required approvals to 1 and include CODEOWNERS)
   - Require status checks to pass before merging (enable CI build job)
   - Require branches to be up to date before merging
   - Include administrators (optional, but enforces the policy for all)
4. Protect `main` strictly: allow merges only via PRs with owner approval.
5. For `staging` you can be more permissive (allow auto-deploy previews), but still require at least 1 approval and passing CI.

Notes:
- I cannot enable these settings programmatically without a GitHub token and admin rights — follow the above UI steps or provide an admin token and I can automate it.
