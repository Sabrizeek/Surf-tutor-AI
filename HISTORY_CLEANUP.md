# History cleanup instructions

This repository in this workspace does not contain a Git working tree (`.git` missing), so I cannot rewrite Git history from here.

Follow these steps on your machine from the *local clone* that contains the `.git` directory (your usual repo clone) to remove secrets from history and rotate credentials safely.

1) Rotate credentials first (important)
   - If you use MongoDB Atlas: login to Atlas -> Security -> Database Access -> Edit the user (or create a new user) and change the password. Alternatively create a new user and delete the old one.
   - Update any running services and your local `.env` with the new password.

2) Prepare the replace file
   - I created a sample `replace.txt` (next to this file). It replaces the known leaked strings with `REDACTED_*` placeholders.

3) Install git-filter-repo
   - PowerShell:
     ```powershell
     python -m pip install --user git-filter-repo
     ```

4) Run git-filter-repo (from the repository root where `.git` is present)
   ```powershell
   # go to your repo root (the path that contains .git)
   Set-Location 'C:\path\to\your\repo'

   # run filter-repo using the replace file
   python -m git_filter_repo --replace-text C:\path\to\repo\replace.txt

   # cleanup
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

5) Inspect the rewritten history locally. If everything looks OK, force-push to the remote and inform collaborators:
   ```powershell
   git push --force --all
   git push --force --tags
   ```

6) Coordinate with collaborators
   - Anyone who cloned the repo must re-clone or follow the repository recovery steps.

If you prefer I prepare and run these steps from a machine that actually has the repo clone and remote credentials, I can guide you interactively.
