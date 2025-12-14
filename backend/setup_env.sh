#!/bin/bash

# Setup Python environment and install mysql-connector-python
# This script creates a virtual environment and installs required dependencies

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$SCRIPT_DIR/venv"

echo "Setting up Python virtual environment..."

# Create virtual environment
if [ ! -d "$VENV_DIR" ]; then
    python3 -m venv "$VENV_DIR"
    echo "Virtual environment created at $VENV_DIR"
else
    echo "Virtual environment already exists at $VENV_DIR"
fi

# Activate virtual environment
source "$VENV_DIR/bin/activate"

echo "Upgrading pip..."
pip install --upgrade pip setuptools wheel

echo "Installing mysql-connector-python..."
pip install mysql-connector-python

echo "Installing requests..."
pip install requests

# Display installed packages
echo ""
echo "Installed packages:"
pip list | grep -E "(mysql-connector|requests|Django|djangorestframework)" || true

echo ""
echo "Setup complete! To activate the environment, run:"
echo "  source $VENV_DIR/bin/activate"
