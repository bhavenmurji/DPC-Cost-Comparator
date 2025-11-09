# Docker Setup Guide - Where to Run Docker

## Understanding the Environment

### What Claude Code Can Do ✅
- Read/write files in your project
- Run Node.js commands (npm, node)
- Execute bash commands
- Commit to git
- Start development servers

### What Claude Code Cannot Do ❌
- Run Docker (no Docker daemon available)
- Access system-level services
- Install system packages (like PostgreSQL)
- Open browser windows
- Access your physical machine's resources directly

## Where Docker Actually Runs

Docker runs on **your local machine** - the physical computer where VSCode is installed.

### Check if Docker is Available on Your Machine

**Option 1: Using VSCode Terminal**

Open a **new terminal** in VSCode (not this Claude Code session):

```bash
# Check if Docker is installed
docker --version

# Check if Docker daemon is running
docker ps

# If both work, you're good to go!
```

**Option 2: Using Your System Terminal**

- **macOS**: Open Terminal.app
- **Windows**: Open PowerShell or Command Prompt
- **Linux**: Open your terminal emulator

Then run:
```bash
docker --version
docker ps
```

### What You'll See

✅ **Docker is Available:**
```bash
$ docker --version
Docker version 24.0.6, build ed223bc

$ docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```

❌ **Docker is NOT Available:**
```bash
$ docker --version
command not found: docker
```

## Installing Docker (If Not Available)

### macOS
1. Download Docker Desktop: https://docs.docker.com/desktop/install/mac-install/
2. Install the .dmg file
3. Launch Docker Desktop from Applications
4. Wait for "Docker Desktop is running" in menu bar

### Windows
1. Download Docker Desktop: https://docs.docker.com/desktop/install/windows-install/
2. Run the installer
3. Restart your computer
4. Launch Docker Desktop
5. Wait for "Docker Desktop is running" in system tray

### Linux (Ubuntu/Debian)
```bash
# Install Docker Engine
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER
newgrp docker
```

## Running the Setup (On Your Machine)

Once Docker is available, open a terminal **in VSCode** or your system terminal:

### Quick Setup (Recommended)
```bash
# Navigate to project
cd /home/bmurji/Development/DPC-Cost-Comparator

# Run the automated setup
./scripts/local-quickstart.sh
```

This script will:
1. ✅ Start PostgreSQL with `docker-compose up -d`
2. ✅ Run database migrations
3. ✅ Import Walmart $4 program
4. ✅ Test DPC scraper
5. ✅ Start API server
6. ✅ Connect to your Live Preview dashboard

### Manual Setup (Step by Step)

If you prefer to run each step manually:

```bash
# 1. Start PostgreSQL
docker-compose up -d

# 2. Wait for PostgreSQL to be ready
sleep 5

# 3. Install dependencies (if not done)
npm install
cd apps/api && npm install

# 4. Run migrations
cd apps/api
npx prisma migrate deploy
npx prisma generate

# 5. Import Walmart program
npm run import:walmart

# 6. Test scraper (10 providers)
npm run scrape:dpc:test

# 7. Start API server
npm run dev
```

## Why Claude Code Can't Run Docker

### Technical Reasons

1. **No Docker Daemon**: Claude Code runs in a sandboxed environment without access to the Docker daemon
2. **No System-Level Access**: Can't install or run system services like PostgreSQL
3. **Security Isolation**: By design, AI coding assistants can't access system resources
4. **Resource Constraints**: Docker containers need dedicated system resources

### What Claude Code IS Doing

Instead of running Docker directly, Claude Code:
- ✅ Created the `docker-compose.yml` configuration
- ✅ Wrote all the migration files
- ✅ Built the complete API server
- ✅ Started the Node.js dev server (running now on port 4000!)
- ✅ Created automation scripts for you to run
- ✅ Generated all documentation

**Think of it like this:**
- **Claude Code** = The architect who designs the building
- **Your machine** = The construction site where the building is built
- **Docker** = The heavy machinery that needs to run on-site

## Current Status

### Running Right Now (In Claude Code Environment)
```
✅ API Server: http://localhost:4000
   - Node.js dev server with tsx watch
   - All 11 REST endpoints defined
   - Healthcare.gov API initialized
   - Walmart data preloaded in memory
```

### Waiting for Docker (On Your Machine)
```
⏳ PostgreSQL Database
   - Will run in Docker container
   - Stores DPC providers, medications, users
   - Enables full API functionality
```

## Next Steps

1. **Check Docker availability** on your machine:
   ```bash
   docker --version && docker ps
   ```

2. **If Docker is available**, run:
   ```bash
   ./scripts/local-quickstart.sh
   ```

3. **If Docker is NOT available**, install it first (see instructions above)

4. **Refresh your Live Preview** - watch the dashboard come alive!

## Verification

Once Docker is running and setup is complete, you should see:

```bash
$ docker ps
CONTAINER ID   IMAGE         COMMAND                  STATUS
abc123def456   postgres:15   "docker-entrypoint.s…"   Up 2 minutes

$ curl http://localhost:4000/api/providers/stats/summary
{
  "success": true,
  "stats": {
    "total": 10,
    "verified": 8,
    ...
  }
}
```

## Troubleshooting

### "Docker daemon is not running"
- **macOS/Windows**: Open Docker Desktop application
- **Linux**: `sudo systemctl start docker`

### "Permission denied"
- **Linux**: Add user to docker group:
  ```bash
  sudo usermod -aG docker $USER
  newgrp docker
  ```

### "Port 5432 already in use"
- Another PostgreSQL instance is running
- Stop it: `sudo service postgresql stop` (Linux)
- Or change port in `docker-compose.yml`

### "docker-compose: command not found"
- Try: `docker compose up -d` (note the space, not hyphen)
- Or install docker-compose plugin

## Summary

| Task | Where It Runs | Status |
|------|---------------|--------|
| API Server (Node.js) | Claude Code Environment | ✅ Running |
| Docker + PostgreSQL | Your Local Machine | ⏳ Needs Setup |
| Database Migrations | Your Local Machine | ⏳ Ready to Run |
| Live Preview Dashboard | VSCode/Browser | ✅ Working |

**The API is running and waiting for you to connect the database!** 🚀

---

**Need help?** Check the other docs:
- [GETTING_STARTED.md](GETTING_STARTED.md)
- [DATABASE_SETUP.md](DATABASE_SETUP.md)
- [EXECUTION_SUMMARY.md](EXECUTION_SUMMARY.md)
