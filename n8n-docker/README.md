# Self-hosted n8n on n8n.ayushmansen.com — Zero Cost

Cloudflare Tunnel exposes your local n8n to the internet with free HTTPS and optional password protection via Cloudflare Access.

## What you get

- `https://n8n.ayushmansen.com` pointing to your local n8n
- Free HTTPS via Cloudflare's Layer 4 tunnel (no open ports on your router)
- Cloudflare Access (optional): password protection with email passcode or Google/GitHub login
- Runs on any machine with Docker — no static IP, no port forwarding

---

## Prerequisites

- Docker + Docker Compose installed
- Domain `ayushmansen.com` on Cloudflare (NS pointing to Cloudflare)
- Cloudflare account (free)

---

## Quick Start

### Step 1 — Create directory

```bash
mkdir n8n-docker && cd n8n-docker
# Save docker-compose.yml here (already created)
```

### Step 2 — Run setup script

```bash
chmod +x setup.sh && ./setup.sh
```

This will:
- Install cloudflared if needed
- Authenticate with Cloudflare
- Create a tunnel named `n8n-tunnel`
- Route `n8n.ayushmansen.com` DNS to it
- Write the config file

### Step 3 — Start containers

```bash
docker compose up -d
```

Check logs:
```bash
docker compose logs -f
```

### Step 4 — Add Cloudflare Access (recommended)

Cloudflare Zero Trust is free for up to 3 users.

1. Go to [dash.teams.cloudflare.com](https://dash.teams.cloudflare.com/) and create a team
2. Go to **Networks > Tunnels** — you should see `n8n-tunnel` connected
3. Click the tunnel > **Public Hostname** > add `n8n.ayushmen.com`
4. Under **Access Policy**, create one:
   - Policy name: `n8n access`
   - Include: **Emails ending in** `@ayushmansen.com` (or any email you choose)
   - Login method: email one-time passcode (free)
5. Now visiting `n8n.ayushmansen.com` asks you to verify your email before reaching n8n

---

## File Structure

```
n8n-docker/
├── docker-compose.yml   # n8n + cloudflared containers
├── setup.sh             # guided setup script
└── cloudflared/
    └── config/
        ├── config.yml   # tunnel config (created by setup.sh)
        └── credentials.json  # tunnel auth (created by setup.sh)
```

---

## Configuration

### Change subdomain

Edit `cloudflared/config/config.yml` and `setup.sh` — replace `n8n.ayushmansen.com` with your desired subdomain.

### Change Cloudflare Access emails

In the Cloudflare Dashboard: **Networks > Tunnels > n8n-tunnel > Access Policy**.

### n8n environment variables

Edit `docker-compose.yml` `environment:` section. Useful ones:

```yaml
- N8N_BASIC_AUTH_ACTIVE=true
- N8N_BASIC_AUTH_USER=admin
- N8N_BASIC_AUTH_PASSWORD=yourpassword
- N8N_ENCRYPTION_KEY=your-32-char-key
- EXECUTIONS_MODE=regular  # avoid queue mode unless you have Redis
```

### Persist n8n data

Data is stored in `./n8n_data/` (mapped to `/home/node/.n8n` inside the container). It's a bind mount — no Docker volumes needed.

---

## Troubleshooting

### Tunnel not connecting

```bash
# Run cloudflared in foreground to see errors
cloudflared tunnel run n8n-tunnel

# Check container logs
docker compose logs -f cloudflared
```

### DNS not resolving

```bash
# Verify DNS is set
nslookup n8n.ayushmansen.com

# Check tunnel status
cloudflared tunnel list
cloudflared tunnel inspect n8n-tunnel
```

### Access policy not working

Make sure your Cloudflare Zero Trust team DNS is configured to route through Cloudflare. The tunnel must show status **HEALTHY** in the dashboard.

---

## Updating

```bash
# Pull latest images
docker compose pull

# Restart
docker compose up -d
```

To update cloudflared on the host:
```bash
cloudflared update
docker compose restart cloudflared
```