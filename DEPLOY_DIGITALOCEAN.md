# DigitalOcean App Platform Deployment

## ☁️ DigitalOcean Deployment (Scalable & Affordable)

### Step 1: Create App Spec File
Create `demo-app-spec.yaml`:
```yaml
name: wealth-wars-demo
services:
- name: web
  source_dir: /apps/web
  github:
    repo: SerStakeAlot/Wealth-Wars
    branch: current-alpha-v2
  run_command: npm start
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  build_command: npm run build
  envs:
  - key: NEXT_PUBLIC_DEMO_ONLY
    value: "true"
  - key: NEXT_PUBLIC_DEMO_URL
    value: "https://demo.wealthwars.io"
  - key: NODE_ENV
    value: "production"
domains:
- domain: demo.wealthwars.io
```

### Step 2: Deploy via CLI
```bash
# Install doctl
wget https://github.com/digitalocean/doctl/releases/download/v1.98.0/doctl-1.98.0-linux-amd64.tar.gz
tar xf doctl-*.tar.gz
sudo mv doctl /usr/local/bin

# Authenticate
doctl auth init

# Create app
doctl apps create --spec demo-app-spec.yaml
```

### Step 3: Configure DNS
```
Type: CNAME
Name: demo  
Target: your-app.ondigitalocean.app
```

## 💰 Pricing
- Basic plan: ~$5/month
- Scales automatically
- Built-in monitoring
