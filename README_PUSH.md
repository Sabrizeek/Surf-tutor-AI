Pushing this project to GitHub (helper)

I added a helper script at `scripts/push-to-remote.ps1` to initialize git (if missing), ensure `.gitignore` ignores `.env`, commit, and push your code to the remote repository.

Before you run anything
- Rotate any leaked credentials (e.g. MongoDB user) if you haven't already.
- Ensure you have git installed and configured with your GitHub credentials (or SSH keys).

Run the helper (PowerShell, from repo root):

```powershell
Set-Location 'C:\Users\sabri\OneDrive\Desktop\RP\Surf_AI_Project'
.\scripts\push-to-remote.ps1 -RemoteUrl 'https://github.com/Sabrizeek/Surf-tutor-AI.git' -Branch main
```

The script will prompt before initializing git, overwriting remote, or force-pushing.

If you prefer manual steps, here they are:

1. Initialize git if needed:
```powershell
git init
git add -A
git commit -m "Initial commit"
```

2. Add the remote and push:
```powershell
git remote add origin https://github.com/Sabrizeek/Surf-tutor-AI.git
git push -u origin main
```

If the remote uses `master` as default branch, replace `main` with `master`.

If pushing fails due to unrelated histories or conflicts, coordinate with your GitHub repo owner or delete the repo remote contents if you want to replace them completely (careful: this is destructive).
