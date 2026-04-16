#!/bin/bash
# n8n + Cloudflare Tunnel + Cloudflare Access Setup
# Domain: n8n.ayushmansen.com

set -e

DOMAIN="n8n.ayushmansen.com"
EMAIL="ayush@ayushmansen.com"
TUNNEL_NAME="n8n-tunnel"
APP_NAME="n8n"

echo "=========================================="
echo "n8n + Cloudflare Tunnel + Access Setup"
echo "=========================================="

# ----------
# 1. Install cloudflared (Windows PowerShell or Linux/Mac)
# ----------
if command -v cloudflared &> /dev/null; then
    echo "[OK] cloudflared already installed"
else
    echo "[INFO] Installing cloudflared..."

    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        winget install -i Cloudflare.cloudflared --accept-package-agreements --accept-source-agreements
    elif [[ "$OSTYPE" == "darwin" ]]; then
        brew install cloudflared
    else
        curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared
        chmod +x /usr/local/bin/cloudflared
    fi
fi

# ----------
# 2. Authenticate with Cloudflare
# ----------
echo ""
echo "[STEP 1] Cloudflare Authentication"
echo "A browser window will open. Authorize cloudflared, then come back."
echo "Press Enter when done..."
read

cloudflared login "$DOMAIN"

# ----------
# 3. Create the tunnel
# ----------
echo ""
echo "[STEP 2] Creating tunnel..."
cloudflared tunnel create "$TUNNEL_NAME" 2>/dev/null || echo "Tunnel may already exist, continuing..."

# Get tunnel ID
TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
if [[ -z "$TUNNEL_ID" ]]; then
    echo "ERROR: Could not find tunnel ID. Run 'cloudflared tunnel list' to check."
    exit 1
fi
echo "[OK] Tunnel ID: $TUNNEL_ID"

# ----------
# 4. Route DNS
# ----------
echo ""
echo "[STEP 3] Creating DNS record for $DOMAIN..."
cloudflared tunnel route dns "$TUNNEL_NAME" "$DOMAIN"

# ----------
# 5. Write config.yml
# ----------
echo ""
echo "[STEP 4] Writing cloudflared config..."

mkdir -p cloudflared/config

cat > cloudflared/config/config.yml << EOF
tunnel: $TUNNEL_ID
credentials-file: /etc/cloudflared/credentials.json
transport-loglevel: info

ingress:
  - hostname: $DOMAIN
    service: http://localhost:5678
  - service: http_status:404
EOF

echo "[OK] Config written to cloudflared/config/config.yml"

# ----------
# 6. Cloudflare Access Policy via Zero Trust API
# ----------
echo ""
echo "[STEP 5] Setting up Cloudflare Access (email passcode auth)..."
echo "This uses Cloudflare Zero Trust free tier."
echo "If you don't have a Zero Trust team set up, you need to create one at:"
echo "  https://dash.teams.cloudflare.com/"
echo ""
echo "Once you have a team name, enter it here (or press Enter to skip and configure manually):"
read -p "Zero Trust Team Name: " TEAM_NAME

if [[ -n "$TEAM_NAME" ]]; then
    # Create an Access policy using the Zero Trust API
    # First get the zone ID and account ID
    echo ""
    echo "[INFO] To use Cloudflare Access, set these env vars or fill them manually:"
    echo "  CLOUDFLARE_ZONE_ID=$(curl -s -H 'Authorization: Bearer $CLOUDFLARE_API_TOKEN' https://api.cloudflare.com/client/v4/zones | jq -r '.result[0].id')"
    echo "  CLOUDFLARE_ACCOUNT_ID=$(curl -s -H 'Authorization: Bearer $CLOUDFLARE_API_TOKEN' https://api.cloudflare.com/client/v4/accounts | jq -r '.result[0].id')"
    echo ""
    echo "You can get an API token at: https://dash.cloudflare.com/profile/api-tokens"
    echo ""
fi

echo ""
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start n8n + cloudflared:"
echo "   cd n8n-docker && docker compose up -d"
echo ""
echo "2. If using Cloudflare Access (recommended):"
echo "   - Go to https://dash.teams.cloudflare.com/"
echo "   - Create a team (free)"
echo "   - Go to Networks > Tunnels > $TUNNEL_NAME"
echo "   - Add a Public Hostname: $DOMAIN"
echo "   - Create an Access Policy requiring email verification"
echo ""
echo "3. Test it:"
echo "   Visit https://$DOMAIN"
echo ""
echo "Troubleshooting:"
echo "  cloudflared tunnel run $TUNNEL_NAME  # run in foreground to see logs"
echo "  docker compose -f n8n-docker/docker-compose.yml logs -f cloudflared"
echo ""

# ----------
# 7. Save tunnel credentials for the docker container
# ----------
echo "[INFO] Copying tunnel credentials to cloudflared/config..."
TUNNEL_CRED_FILE=$(cloudflared tunnel credentials list | grep -A1 "$TUNNEL_NAME" | grep -oP '(?<=~/.cloudflared/)[^ ]+(?=\.json)')
if [[ -n "$TUNNEL_CRED_FILE" ]]; then
    cp "~/.cloudflared/$TUNNEL_CRED_FILE.json" "cloudflared/config/credentials.json" 2>/dev/null || \
    cp "$HOME/.cloudflared/$TUNNEL_CRED_FILE.json" "cloudflared/config/credentials.json" 2>/dev/null || \
    echo "[WARN] Could not copy credentials automatically. See docs above."
fi

echo "[DONE]"