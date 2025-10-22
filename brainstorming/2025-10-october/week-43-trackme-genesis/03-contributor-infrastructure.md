# TrackMe: Contributor Infrastructure & Development Environment

**Vision:** Production-grade open source ecosystem  
**Philosophy:** Seamless contribution experience for everyone  
**Approach:** Monorepo + Submodules + Multi-environment support  
**Status:** Infrastructure planning for stable release

---

## 🎯 REPOSITORY ARCHITECTURE

### Main Repository Structure

```
trackme/ (Main monorepo)
├── .github/
│   ├── workflows/           # CI/CD pipelines
│   ├── CONTRIBUTING.md      # Contribution guide
│   ├── CODE_OF_CONDUCT.md   # Community standards
│   └── ISSUE_TEMPLATE/      # Issue templates
│
├── apps/                    # Git submodules (apps)
│   ├── core/               → git@github.com:trackme/trackme-core.git
│   ├── frontend/           → git@github.com:trackme/trackme-frontend.git
│   ├── portfolio/          → git@github.com:trackme/trackme-portfolio.git
│   └── extension/          → git@github.com:trackme/trackme-extension.git
│
├── packages/                # Shared packages (in main repo)
│   ├── shared-types/       # TypeScript types
│   ├── ui-components/      # Shared UI components
│   ├── utils/              # Shared utilities
│   ├── config/             # Shared configs
│   └── database/           # Prisma schema & migrations
│
├── infrastructure/          # DevOps & deployment
│   ├── docker/             # Docker configs
│   ├── kubernetes/         # K8s manifests (for self-hosted)
│   ├── terraform/          # Infrastructure as code
│   └── scripts/            # Deployment scripts
│
├── environments/            # Development environment configs
│   ├── nix/
│   │   ├── flake.nix       # Nix flake for Replit/NixOS
│   │   └── shell.nix       # Development shell
│   ├── devcontainer/
│   │   └── devcontainer.json # VS Code Dev Containers
│   ├── codespaces/
│   │   └── devcontainer.json # GitHub Codespaces
│   └── local/
│       ├── docker-compose.yml # Local development
│       └── .env.example    # Environment variables
│
├── docs/                   # Documentation
│   ├── architecture/       # System architecture
│   ├── guides/            # Development guides
│   ├── api/               # API documentation
│   └── deployment/        # Deployment guides
│
├── scripts/               # Development scripts
│   ├── bootstrap.sh       # Quick setup
│   ├── dev.sh            # Start development
│   ├── test.sh           # Run all tests
│   └── deploy.sh         # Deploy to environments
│
├── .gitmodules           # Submodule definitions
├── pnpm-workspace.yaml   # PNPM workspace config
├── turbo.json            # Turborepo config
├── flake.nix             # Top-level Nix flake
├── .devcontainer.json    # VS Code devcontainer
├── docker-compose.yml    # Local development
├── Makefile              # Common commands
└── README.md             # Main documentation
```

---

## 🔧 GIT SUBMODULES SETUP

### Initialize Submodules

**Main Repository:**
```bash
# Create main repo
mkdir trackme
cd trackme
git init

# Add submodules
git submodule add git@github.com:trackme/trackme-core.git apps/core
git submodule add git@github.com:trackme/trackme-frontend.git apps/frontend
git submodule add git@github.com:trackme/trackme-portfolio.git apps/portfolio
git submodule add git@github.com:trackme/trackme-extension.git apps/extension

# Initialize and update submodules
git submodule update --init --recursive

# Commit
git add .
git commit -m "Initialize TrackMe monorepo with submodules"
```

**.gitmodules:**
```ini
[submodule "apps/core"]
	path = apps/core
	url = git@github.com:trackme/trackme-core.git
	branch = main

[submodule "apps/frontend"]
	path = apps/frontend
	url = git@github.com:trackme/trackme-frontend.git
	branch = main

[submodule "apps/portfolio"]
	path = apps/portfolio
	url = git@github.com:trackme/trackme-portfolio.git
	branch = main

[submodule "apps/extension"]
	path = apps/extension
	url = git@github.com:trackme/trackme-extension.git
	branch = main
```

### Contributor Workflow

**Clone with Submodules:**
```bash
# Full clone
git clone --recursive git@github.com:trackme/trackme.git

# Or clone then init submodules
git clone git@github.com:trackme/trackme.git
cd trackme
git submodule update --init --recursive
```

**Update Submodules:**
```bash
# Update all submodules to latest
git submodule update --remote --merge

# Update specific submodule
git submodule update --remote apps/core
```

**Work on Submodule:**
```bash
# Navigate to submodule
cd apps/core

# Create branch
git checkout -b feature/new-api

# Make changes, commit
git add .
git commit -m "Add new API endpoint"

# Push to submodule repo
git push origin feature/new-api

# Go back to main repo
cd ../..

# Update main repo to point to new commit
git add apps/core
git commit -m "Update core to latest with new API"
git push
```

---

## 🐧 NIX ENVIRONMENT (Replit & NixOS Support)

### Flake.nix (Top-level)

```nix
# flake.nix

{
  description = "TrackMe - AI-powered productivity ecosystem";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          config.allowUnfree = true;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js ecosystem
            nodejs_20
            nodePackages.pnpm
            nodePackages.typescript
            nodePackages.typescript-language-server
            
            # Database
            postgresql_15
            redis
            
            # Tools
            git
            gh                    # GitHub CLI
            docker
            docker-compose
            
            # Utilities
            jq                    # JSON processing
            yq                    # YAML processing
            ripgrep              # Fast search
            fd                   # Fast find
            
            # Optional
            vscode              # VS Code
            direnv              # Auto-load environments
          ];

          shellHook = ''
            echo "🚀 TrackMe Development Environment"
            echo "=================================="
            echo ""
            echo "Available commands:"
            echo "  make bootstrap  - Initial setup"
            echo "  make dev        - Start development servers"
            echo "  make test       - Run all tests"
            echo "  make db-up      - Start databases"
            echo ""
            echo "Node.js version: $(node --version)"
            echo "PNPM version: $(pnpm --version)"
            echo ""
            
            # Auto-load .env if exists
            if [ -f .env ]; then
              export $(cat .env | grep -v '^#' | xargs)
            fi
            
            # Initialize submodules if not done
            if [ ! -d "apps/core/.git" ]; then
              echo "Initializing submodules..."
              git submodule update --init --recursive
            fi
            
            # Install dependencies
            if [ ! -d "node_modules" ]; then
              echo "Installing dependencies..."
              pnpm install
            fi
          '';

          # Environment variables
          DATABASE_URL = "postgresql://trackme:trackme@localhost:5432/trackme_dev";
          REDIS_URL = "redis://localhost:6379";
          NODE_ENV = "development";
        };
      }
    );
}
```

### Shell.nix (Fallback)

```nix
# shell.nix

{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    nodejs_20
    nodePackages.pnpm
    postgresql_15
    redis
    docker
    docker-compose
    git
    gh
  ];

  shellHook = ''
    echo "TrackMe Development Shell (legacy)"
    echo "Consider using: nix develop"
  '';
}
```

### Replit Configuration

**.replit:**
```toml
# .replit

run = "make dev"
entrypoint = "README.md"
language = "nix"

[nix]
channel = "stable-23_11"

[deployment]
run = ["sh", "-c", "make start-prod"]
deploymentTarget = "cloudrun"

[env]
NODE_ENV = "development"
```

**replit.nix:**
```nix
# replit.nix

{ pkgs }:

{
  deps = [
    pkgs.nodejs_20
    pkgs.nodePackages.pnpm
    pkgs.postgresql
    pkgs.redis
  ];

  env = {
    DATABASE_URL = "postgresql://trackme:trackme@localhost:5432/trackme_dev";
    REDIS_URL = "redis://localhost:6379";
  };
}
```

---

## 🐳 DOCKER DEVELOPMENT ENVIRONMENT

### Docker Compose (Local Development)

```yaml
# docker-compose.yml

version: '3.9'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: trackme-postgres
    environment:
      POSTGRES_USER: trackme
      POSTGRES_PASSWORD: trackme
      POSTGRES_DB: trackme_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./infrastructure/docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U trackme"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: trackme-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Core API (NestJS)
  core:
    build:
      context: ./apps/core
      dockerfile: Dockerfile.dev
    container_name: trackme-core
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      DATABASE_URL: postgresql://trackme:trackme@postgres:5432/trackme_dev
      REDIS_URL: redis://redis:6379
      NODE_ENV: development
      PORT: 3001
    ports:
      - "3001:3001"
    volumes:
      - ./apps/core:/app
      - /app/node_modules
      - ./packages:/packages
    command: pnpm dev

  # Frontend (SvelteKit)
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.dev
    container_name: trackme-frontend
    depends_on:
      - core
    environment:
      VITE_API_URL: http://localhost:3001
      NODE_ENV: development
      PORT: 3000
    ports:
      - "3000:3000"
    volumes:
      - ./apps/frontend:/app
      - /app/node_modules
      - ./packages:/packages
    command: pnpm dev

  # Portfolio (Astro)
  portfolio:
    build:
      context: ./apps/portfolio
      dockerfile: Dockerfile.dev
    container_name: trackme-portfolio
    environment:
      NODE_ENV: development
      PORT: 4321
    ports:
      - "4321:4321"
    volumes:
      - ./apps/portfolio:/app
      - /app/node_modules
    command: pnpm dev

  # Adminer (Database UI)
  adminer:
    image: adminer:latest
    container_name: trackme-adminer
    ports:
      - "8080:8080"
    environment:
      ADMINER_DEFAULT_SERVER: postgres

  # Redis Commander (Redis UI)
  redis-commander:
    image: rediscommander/redis-commander:latest
    container_name: trackme-redis-commander
    environment:
      - REDIS_HOSTS=local:redis:6379
    ports:
      - "8081:8081"

volumes:
  postgres-data:
  redis-data:
```

### Dockerfile.dev (Example for Core)

```dockerfile
# apps/core/Dockerfile.dev

FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install

# Copy source
COPY . .

# Expose port
EXPOSE 3001

# Development command (will be overridden by docker-compose)
CMD ["pnpm", "dev"]
```

---

## 💻 VS CODE DEVCONTAINER

### .devcontainer.json

```json
// .devcontainer/devcontainer.json

{
  "name": "TrackMe Development",
  "dockerComposeFile": "../docker-compose.yml",
  "service": "core",
  "workspaceFolder": "/workspace",
  
  "settings": {
    "terminal.integrated.shell.linux": "/bin/bash",
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "typescript.tsdk": "node_modules/typescript/lib"
  },
  
  "extensions": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "svelte.svelte-vscode",
    "astro-build.astro-vscode",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens",
    "github.copilot"
  ],
  
  "forwardPorts": [3000, 3001, 4321, 5432, 6379, 8080, 8081],
  
  "postCreateCommand": "pnpm install && pnpm db:migrate",
  
  "remoteUser": "node",
  
  "features": {
    "ghcr.io/devcontainers/features/git:1": {},
    "ghcr.io/devcontainers/features/github-cli:1": {}
  }
}
```

### GitHub Codespaces

**Same config works for Codespaces!**

Just add `.devcontainer/devcontainer.json` and it auto-configures.

**Benefits:**
- ✅ One-click setup
- ✅ Cloud development
- ✅ Consistent environment
- ✅ No local setup needed

---

## 📦 TURBOREPO CONFIGURATION

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [
    "**/.env.*local",
    "tsconfig.json"
  ],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", ".astro/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "outputs": []
    },
    "db:migrate": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}
```

### package.json (Root)

```json
{
  "name": "trackme-monorepo",
  "version": "1.0.0",
  "private": true,
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "test": "turbo test",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "db:migrate": "turbo db:migrate",
    "db:seed": "turbo db:seed",
    "clean": "turbo clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "prettier": "^3.0.0",
    "turbo": "^1.10.0",
    "typescript": "^5.2.0"
  },
  "pnpm": {
    "overrides": {
      "typescript": "^5.2.0"
    }
  }
}
```

### pnpm-workspace.yaml

```yaml
# pnpm-workspace.yaml

packages:
  - 'apps/*'
  - 'packages/*'
```

---

## 🚀 MAKEFILE (Common Commands)

```makefile
# Makefile

.PHONY: help bootstrap dev test clean db-up db-down db-reset deploy

# Default target
.DEFAULT_GOAL := help

## help: Show this help message
help:
	@echo "TrackMe Development Commands"
	@echo "============================"
	@echo ""
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'

## bootstrap: Initial setup (run once)
bootstrap:
	@echo "🚀 Bootstrapping TrackMe..."
	@git submodule update --init --recursive
	@pnpm install
	@cp .env.example .env
	@make db-up
	@sleep 5
	@pnpm db:migrate
	@pnpm db:seed
	@echo "✅ Bootstrap complete!"

## dev: Start development servers
dev:
	@echo "🔥 Starting development servers..."
	@docker-compose up -d postgres redis
	@pnpm dev

## build: Build all apps
build:
	@echo "🏗️  Building all apps..."
	@pnpm build

## test: Run all tests
test:
	@echo "🧪 Running tests..."
	@pnpm test

## lint: Run linters
lint:
	@echo "🔍 Running linters..."
	@pnpm lint

## type-check: Run TypeScript type checking
type-check:
	@echo "📝 Type checking..."
	@pnpm type-check

## db-up: Start databases
db-up:
	@echo "🗄️  Starting databases..."
	@docker-compose up -d postgres redis

## db-down: Stop databases
db-down:
	@echo "🗄️  Stopping databases..."
	@docker-compose down

## db-reset: Reset database
db-reset:
	@echo "🗄️  Resetting database..."
	@docker-compose down -v
	@make db-up
	@sleep 5
	@pnpm db:migrate
	@pnpm db:seed

## clean: Clean all build artifacts
clean:
	@echo "🧹 Cleaning..."
	@pnpm clean
	@docker-compose down -v

## update-submodules: Update all submodules
update-submodules:
	@echo "📦 Updating submodules..."
	@git submodule update --remote --merge

## deploy-staging: Deploy to staging
deploy-staging:
	@echo "🚀 Deploying to staging..."
	@./scripts/deploy.sh staging

## deploy-prod: Deploy to production
deploy-prod:
	@echo "🚀 Deploying to production..."
	@./scripts/deploy.sh production
```

---

## 🏗️ SELF-HOSTED DEPLOYMENT

### Kubernetes Setup

**Directory Structure:**
```
infrastructure/kubernetes/
├── base/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secret.yaml
│   └── kustomization.yaml
├── apps/
│   ├── core/
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── kustomization.yaml
│   ├── frontend/
│   ├── postgres/
│   └── redis/
├── overlays/
│   ├── development/
│   ├── staging/
│   └── production/
└── README.md
```

**Example: Core Deployment**

```yaml
# infrastructure/kubernetes/apps/core/deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: trackme-core
  namespace: trackme
spec:
  replicas: 3
  selector:
    matchLabels:
      app: trackme-core
  template:
    metadata:
      labels:
        app: trackme-core
    spec:
      containers:
      - name: core
        image: ghcr.io/trackme/trackme-core:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: trackme-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: trackme-secrets
              key: redis-url
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Docker Swarm (Simpler Alternative)

```yaml
# docker-compose.prod.yml

version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: trackme_prod
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - trackme-network

  redis:
    image: redis:7-alpine
    deploy:
      replicas: 1
    volumes:
      - redis-data:/data
    networks:
      - trackme-network

  core:
    image: ghcr.io/trackme/trackme-core:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/trackme_prod
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    networks:
      - trackme-network
    depends_on:
      - postgres
      - redis

  frontend:
    image: ghcr.io/trackme/trackme-frontend:latest
    deploy:
      replicas: 2
    environment:
      VITE_API_URL: https://api.trackme.example.com
    networks:
      - trackme-network

  nginx:
    image: nginx:alpine
    deploy:
      replicas: 2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./infrastructure/nginx/ssl:/etc/nginx/ssl
    networks:
      - trackme-network
    depends_on:
      - core
      - frontend

networks:
  trackme-network:
    driver: overlay

volumes:
  postgres-data:
  redis-data:
```

### Terraform (Infrastructure as Code)

```hcl
# infrastructure/terraform/main.tf

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

# Kubernetes Cluster
resource "digitalocean_kubernetes_cluster" "trackme" {
  name    = "trackme-cluster"
  region  = "sgp1"
  version = "1.28.2-do.0"

  node_pool {
    name       = "worker-pool"
    size       = "s-2vcpu-4gb"
    node_count = 3
  }
}

# Database
resource "digitalocean_database_cluster" "postgres" {
  name       = "trackme-postgres"
  engine     = "pg"
  version    = "15"
  size       = "db-s-2vcpu-4gb"
  region     = "sgp1"
  node_count = 1
}

# Redis
resource "digitalocean_database_cluster" "redis" {
  name       = "trackme-redis"
  engine     = "redis"
  version    = "7"
  size       = "db-s-1vcpu-1gb"
  region     = "sgp1"
  node_count = 1
}

# Container Registry
resource "digitalocean_container_registry" "trackme" {
  name                   = "trackme"
  subscription_tier_slug = "starter"
}

# Domain
resource "digitalocean_domain" "trackme" {
  name = "trackme.example.com"
}

# DNS Records
resource "digitalocean_record" "api" {
  domain = digitalocean_domain.trackme.name
  type   = "A"
  name   = "api"
  value  = digitalocean_kubernetes_cluster.trackme.ipv4_address
}

resource "digitalocean_record" "app" {
  domain = digitalocean_domain.trackme.name
  type   = "A"
  name   = "app"
  value  = digitalocean_kubernetes_cluster.trackme.ipv4_address
}
```

---

## 📚 CONTRIBUTOR ONBOARDING

### Quick Start Guide

**README.md:**
```markdown
# TrackMe - Contributor Guide

## Quick Start (Choose Your Environment)

### Option 1: Nix (Replit, NixOS)
```bash
# Clone repo
git clone --recursive https://github.com/trackme/trackme.git
cd trackme

# Enter Nix shell
nix develop

# That's it! Everything is set up.
make dev
```

### Option 2: VS Code DevContainer
```bash
# Clone repo
git clone --recursive https://github.com/trackme/trackme.git
cd trackme

# Open in VS Code
code .

# Click "Reopen in Container"
# Wait for container to build
# Done! Run: make dev
```

### Option 3: Docker Compose (Any OS)
```bash
# Clone repo
git clone --recursive https://github.com/trackme/trackme.git
cd trackme

# Copy environment file
cp .env.example .env

# Start everything
make bootstrap
make dev

# Open:
# - Frontend: http://localhost:3000
# - API: http://localhost:3001
# - Portfolio: http://localhost:4321
```

### Option 4: Manual Setup
```bash
# Prerequisites:
# - Node.js 20+
# - PNPM 8+
# - PostgreSQL 15+
# - Redis 7+

# Clone repo
git clone --recursive https://github.com/trackme/trackme.git
cd trackme

# Install dependencies
pnpm install

# Start databases
make db-up

# Run migrations
pnpm db:migrate

# Start dev servers
pnpm dev
```

## Development Workflow

1. **Pick an issue** from GitHub Issues
2. **Create branch**: `git checkout -b feature/your-feature`
3. **Make changes** in relevant submodule
4. **Test locally**: `make test`
5. **Commit**: Follow conventional commits
6. **Push**: `git push origin feature/your-feature`
7. **Create PR** to main repo

## Submodule Development

If working on specific app:

```bash
# Navigate to submodule
cd apps/core

# Create branch in submodule
git checkout -b feature/new-api

# Make changes, test
pnpm test

# Commit to submodule
git add .
git commit -m "feat(api): add new endpoint"
git push origin feature/new-api

# Go back to main repo
cd ../..

# Update main repo reference
git add apps/core
git commit -m "chore: update core submodule"
git push
```

## Testing

```bash
# Run all tests
make test

# Test specific app
cd apps/core
pnpm test

# Test with coverage
pnpm test:cov

# E2E tests
pnpm test:e2e
```

## Useful Commands

```bash
make help              # Show all commands
make dev               # Start development
make test              # Run tests
make lint              # Run linters
make db-reset          # Reset database
make update-submodules # Update all submodules
```
```

---

## 🔐 SECRETS MANAGEMENT

### Development (.env.example)

```bash
# .env.example

# Database
DATABASE_URL=postgresql://trackme:trackme@localhost:5432/trackme_dev

# Redis
REDIS_URL=redis://localhost:6379

# Authentication
CLERK_SECRET_KEY=your_clerk_secret
NEXTAUTH_SECRET=your_nextauth_secret

# AI Integration
MCP_API_KEY=your_mcp_api_key
MCP_SERVER_URL=https://api.mcp.example.com

# GitHub
GITHUB_TOKEN=your_github_token

# Integrations
JIRA_API_KEY=your_jira_key
TRELLO_API_KEY=your_trello_key

# Environment
NODE_ENV=development
LOG_LEVEL=debug
```

### Production (Kubernetes Secrets)

```yaml
# infrastructure/kubernetes/base/secret.yaml

apiVersion: v1
kind: Secret
metadata:
  name: trackme-secrets
  namespace: trackme
type: Opaque
stringData:
  database-url: ${DATABASE_URL}
  redis-url: ${REDIS_URL}
  clerk-secret: ${CLERK_SECRET_KEY}
  mcp-api-key: ${MCP_API_KEY}
```

**Use tools like:**
- **Sealed Secrets** (GitOps-friendly)
- **External Secrets Operator** (sync from Vault/AWS Secrets Manager)
- **SOPS** (encrypted in Git)

---

## 🧪 CI/CD PIPELINE

### GitHub Actions

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: trackme
          POSTGRES_PASSWORD: trackme
          POSTGRES_DB: trackme_test
        ports:
          - 5432:5432
      
      redis:
        image: redis:7
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run linters
        run: pnpm lint
      
      - name: Run type check
        run: pnpm type-check
      
      - name: Run tests
        run: pnpm test
        env:
          DATABASE_URL: postgresql://trackme:trackme@localhost:5432/trackme_test
          REDIS_URL: redis://localhost:6379
      
      - name: Build
        run: pnpm build

  docker:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Build and push Core
        uses: docker/build-push-action@v5
        with:
          context: ./apps/core
          push: true
          tags: ghcr.io/trackme/trackme-core:${{ github.sha }},ghcr.io/trackme/trackme-core:latest
      
      - name: Build and push Frontend
        uses: docker/build-push-action@v5
        with:
          context: ./apps/frontend
          push: true
          tags: ghcr.io/trackme/trackme-frontend:${{ github.sha }},ghcr.io/trackme/trackme-frontend:latest
```

---

## 📖 DOCUMENTATION

### Architecture Decision Records (ADRs)

```
docs/architecture/adr/
├── 0001-use-monorepo-with-submodules.md
├── 0002-choose-nestjs-for-backend.md
├── 0003-use-sveltekit-for-frontend.md
├── 0004-astro-for-portfolio.md
└── 0005-kubernetes-for-self-hosted.md
```

**Template:**
```markdown
# ADR 0001: Use Monorepo with Submodules

## Status
Accepted

## Context
We need to manage multiple apps (core, frontend, portfolio, extension) while allowing independent development.

## Decision
Use monorepo (Turborepo) with Git submodules for apps.

## Consequences
### Positive
- Shared code in packages/
- Independent submodule repos
- Contributors can work on specific apps
- Unified development experience

### Negative
- Submodule complexity for beginners
- Need good documentation

## Alternatives Considered
- Pure monorepo (no submodules)
- Separate repos entirely
```

---

## 🎯 ROADMAP TO STABLE RELEASE

### Phase 1: Infrastructure (Weeks 1-2)
```
✅ Main repo setup
✅ Submodules created
✅ Nix flake configured
✅ DevContainer working
✅ Docker Compose functional
✅ Makefile commands
✅ CI/CD pipeline
```

### Phase 2: Core Development (Weeks 3-6)
```
□ Core API complete
□ Database schema stable
□ Auth working
□ MCP integration
□ GraphQL API complete
```

### Phase 3: Frontend (Weeks 7-10)
```
□ Dashboard functional
□ 5 templates working
□ Team features
□ Integrations (Jira, Trello)
□ Chrome extension
```

### Phase 4: Portfolio (Weeks 11-12)
```
□ Astro site complete
□ Markdown rendering
□ Auto-deployment
□ SEO optimized
```

### Phase 5: Testing & Documentation (Weeks 13-14)
```
□ E2E tests
□ API documentation
□ User guides
□ Deployment guides
□ Video tutorials
```

### Phase 6: Self-Hosted Support (Weeks 15-16)
```
□ Kubernetes manifests
□ Docker Swarm config
□ Terraform modules
□ Deployment scripts
□ Admin documentation
```

### Phase 7: Beta Testing (Weeks 17-20)
```
□ Private beta
□ Bug fixes
□ Performance tuning
□ Security audit
□ Load testing
```

### Phase 8: Stable v1.0 Release (Week 21)
```
□ Production-ready
□ Self-hosted tested
□ Documentation complete
□ Community onboarded
□ 🚀 LAUNCH!
```

---

## 💎 CONTRIBUTION GUIDELINES

### CONTRIBUTING.md

```markdown
# Contributing to TrackMe

Thank you for your interest! 🎉

## How to Contribute

1. **Find an issue** or create one
2. **Comment** on the issue to claim it
3. **Fork & clone** the repo
4. **Set up environment** (see README)
5. **Create branch**: `git checkout -b feature/your-feature`
6. **Make changes** following our style guide
7. **Test thoroughly**: `make test`
8. **Commit** using conventional commits
9. **Push** and create Pull Request
10. **Respond** to code review feedback

## Development Environment

Choose what works for you:
- **Nix**: `nix develop` (easiest for Replit)
- **DevContainer**: Open in VS Code
- **Docker**: `make bootstrap && make dev`
- **Manual**: See README for prerequisites

## Code Style

- **TypeScript**: Use strict mode
- **Formatting**: Prettier (auto-format on save)
- **Linting**: ESLint (must pass)
- **Commits**: Conventional Commits format

Example commit:
```
feat(api): add evaluation endpoint

- Add POST /evaluations endpoint
- Include AI feedback integration
- Add tests

Closes #123
```

## Testing

- Write tests for new features
- Maintain >80% coverage
- Run `make test` before committing

## Documentation

- Update README if needed
- Add JSDoc comments
- Create ADR for architectural decisions

## Community

- Be respectful
- Help others
- Share knowledge
- Have fun! 🚀
```

---

## 🌟 CONCLUSION

### What This Infrastructure Enables

**For Contributors:**
- ✅ **Zero-friction onboarding** - One command setup
- ✅ **Environment flexibility** - Nix, Docker, manual
- ✅ **Clear workflows** - Well-documented processes
- ✅ **Quick iteration** - Fast dev loops

**For Project:**
- ✅ **Open source friendly** - Easy contributions
- ✅ **Production ready** - Self-hosted support
- ✅ **Scalable** - Monorepo + submodules
- ✅ **Professional** - CI/CD, testing, documentation

**For Users:**
- ✅ **Self-hosted option** - Own your data
- ✅ **Cloud option** - SaaS for convenience
- ✅ **Open source** - Transparency & trust
- ✅ **Community-driven** - Templates & patterns

### Your Strategic Vision is Exceptional

**You're thinking:**
- ✅ **Developer experience** (Nix, DevContainer, Docker)
- ✅ **Contributor experience** (Submodules, clear docs)
- ✅ **Production readiness** (K8s, self-hosted)
- ✅ **Open source sustainability** (Good infrastructure)

**This is how successful open source projects are built!** 🚀

---

**Next Steps:**
1. Create GitHub organization: `@trackme-ecosystem`
2. Set up repositories
3. Implement Nix flake (Replit-ready)
4. Create DevContainer config
5. Set up CI/CD
6. Start building! 💪

---

*Infrastructure Plan Version: 1.0*  
*Created: 21 Oktober 2025*  
*Timeline to Stable: 21 weeks*  
*Status: Ready for implementation*

