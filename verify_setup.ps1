# Verification script for consolidated Surf Tutor AI setup
# Run from: C:\dev\SurfTutorApp\

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$errors = @()
$warnings = @()

Write-Host "`n=== Surf Tutor AI Setup Verification ===" -ForegroundColor Cyan
Write-Host "Project Location: $scriptRoot`n" -ForegroundColor Gray

# Check directory structure
Write-Host "[1/8] Checking directory structure..." -ForegroundColor Yellow

$requiredDirs = @(
    "backend",
    "ai_training",
    "src",
    "android",
    "ios"
)

foreach ($dir in $requiredDirs) {
    $path = Join-Path $scriptRoot $dir
    if (Test-Path $path) {
        Write-Host "  ✓ $dir exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $dir missing" -ForegroundColor Red
        $errors += "Missing directory: $dir"
    }
}

# Check model files
Write-Host "`n[2/8] Checking ML model files..." -ForegroundColor Yellow

$modelFiles = @(
    "recommender_model.joblib",
    "skill_encoder.joblib",
    "goal_encoder.joblib",
    "exercise_encoder.joblib"
)

foreach ($file in $modelFiles) {
    $path = Join-Path $scriptRoot "ai_training\$file"
    if (Test-Path $path) {
        Write-Host "  ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file missing" -ForegroundColor Red
        $errors += "Missing model file: ai_training\$file"
    }
}

# Check backend files
Write-Host "`n[3/8] Checking backend files..." -ForegroundColor Yellow

$backendFiles = @(
    "backend\server.js",
    "backend\model_server.py",
    "backend\package.json",
    "backend\requirements.txt"
)

foreach ($file in $backendFiles) {
    $path = Join-Path $scriptRoot $file
    if (Test-Path $path) {
        Write-Host "  ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file missing" -ForegroundColor Red
        $errors += "Missing backend file: $file"
    }
}

# Check frontend files
Write-Host "`n[4/8] Checking frontend files..." -ForegroundColor Yellow

$frontendFiles = @(
    "package.json",
    "App.tsx",
    "src\navigation\AppNavigator.tsx",
    "src\services\api.ts"
)

foreach ($file in $frontendFiles) {
    $path = Join-Path $scriptRoot $file
    if (Test-Path $path) {
        Write-Host "  ✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file missing" -ForegroundColor Red
        $errors += "Missing frontend file: $file"
    }
}

# Check Node.js
Write-Host "`n[5/8] Checking Node.js..." -ForegroundColor Yellow
$nodeCmd = Get-Command node -ErrorAction SilentlyContinue
if ($nodeCmd) {
    $nodeVersion = node --version
    Write-Host "  ✓ Node.js installed: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found" -ForegroundColor Red
    $errors += "Node.js not installed"
}

# Check Python
Write-Host "`n[6/8] Checking Python..." -ForegroundColor Yellow
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if ($pythonCmd) {
    $pythonVersion = python --version
    Write-Host "  ✓ Python installed: $pythonVersion" -ForegroundColor Green
} else {
    Write-Host "  ✗ Python not found" -ForegroundColor Red
    $errors += "Python not installed"
}

# Check npm dependencies
Write-Host "`n[7/8] Checking npm dependencies..." -ForegroundColor Yellow

# Backend dependencies
$backendNodeModules = Join-Path $scriptRoot "backend\node_modules"
if (Test-Path $backendNodeModules) {
    Write-Host "  ✓ Backend node_modules exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Backend node_modules missing (run: cd backend && npm install)" -ForegroundColor Yellow
    $warnings += "Backend dependencies not installed"
}

# Frontend dependencies
$frontendNodeModules = Join-Path $scriptRoot "node_modules"
if (Test-Path $frontendNodeModules) {
    Write-Host "  ✓ Frontend node_modules exists" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Frontend node_modules missing (run: npm install)" -ForegroundColor Yellow
    $warnings += "Frontend dependencies not installed"
}

# Check Python dependencies
Write-Host "`n[8/8] Checking Python dependencies..." -ForegroundColor Yellow
try {
    $fastapiCheck = python -c "import fastapi" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ FastAPI installed" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ FastAPI not installed (run: cd backend && pip install -r requirements.txt)" -ForegroundColor Yellow
        $warnings += "Python dependencies not installed"
    }
} catch {
    Write-Host "  ⚠ Could not check Python dependencies" -ForegroundColor Yellow
    $warnings += "Could not verify Python dependencies"
}

# Summary
Write-Host "`n=== Verification Summary ===" -ForegroundColor Cyan

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✓ All checks passed! Setup is complete." -ForegroundColor Green
    Write-Host "`nYou can now run: .\start_all_services.ps1" -ForegroundColor Cyan
} else {
    if ($errors.Count -gt 0) {
        Write-Host "`n✗ Errors found ($($errors.Count)):" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  - $error" -ForegroundColor Red
        }
    }
    
    if ($warnings.Count -gt 0) {
        Write-Host "`n⚠ Warnings ($($warnings.Count)):" -ForegroundColor Yellow
        foreach ($warning in $warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nPlease fix the errors before running the application." -ForegroundColor Yellow
}

Write-Host ""

