#!/bin/bash
set -e

echo "Installing Solana CLI (Linux) from latest GitHub release..."

# Get latest release tag
TAG=$(curl -s https://api.github.com/repos/solana-labs/solana/releases/latest | grep "tag_name" | cut -d '"' -f 4)
if [ -z "$TAG" ]; then
  echo "Unable to determine latest Solana release tag."
  exit 1
fi
echo "Latest release: $TAG"

# Download Linux archive
TAR_URL="https://github.com/solana-labs/solana/releases/download/$TAG/solana-release-x86_64-unknown-linux-gnu.tar.bz2"
TAR_PATH="/tmp/solana-release-x86_64-unknown-linux-gnu.tar.bz2"
echo "Downloading: $TAR_URL"
wget -q -O "$TAR_PATH" "$TAR_URL"
echo "Downloaded to: $TAR_PATH"

# Extract to user-local install dir
INSTALL_ROOT="$HOME/.local/share/solana/install"
mkdir -p "$INSTALL_ROOT"
echo "Extracting to: $INSTALL_ROOT"
tar -xjf "$TAR_PATH" -C "$INSTALL_ROOT"
echo "Extraction complete."

# Locate solana
SOL_EXE=$(find "$INSTALL_ROOT" -name solana -type f | head -1)
if [ -z "$SOL_EXE" ]; then
  echo "solana not found after extraction."
  exit 1
fi
SOL_BIN=$(dirname "$SOL_EXE")
echo "Found solana at: $SOL_EXE"

# Update PATH for current session and print version
if [[ ":$PATH:" != *":$SOL_BIN:"* ]]; then
  export PATH="$SOL_BIN:$PATH"
fi

"$SOL_EXE" --version

echo "Solana CLI installed for current session."
