#!/bin/bash
# Script to deploy frontend to linux2 server

# Variables
REMOTE_SERVER="root@linux2"
REMOTE_PATH="/py-projects/billing-frontend"

echo "=== Deploying frontend to $REMOTE_SERVER:$REMOTE_PATH ==="

# Check if the dist directory exists
if [ ! -d "dist" ]; then
  echo "Error: dist directory not found. Run 'npm run build' first."
  exit 1
fi

# Create a tar of the built frontend
echo "Creating deployment package..."
tar -czf frontend-deploy.tar.gz dist

# Ensure the remote directory exists
echo "Ensuring remote directory exists..."
ssh $REMOTE_SERVER "mkdir -p $REMOTE_PATH"

# Copy the tar to the remote server
echo "Copying files to remote server..."
scp frontend-deploy.tar.gz $REMOTE_SERVER:$REMOTE_PATH/

# Extract files on remote server and set up nginx if needed
echo "Extracting files on remote server..."
ssh $REMOTE_SERVER << EOF
  cd $REMOTE_PATH
  
  # Extract files
  tar -xzf frontend-deploy.tar.gz
  rm frontend-deploy.tar.gz
  
  # Check if nginx is installed
  if command -v nginx > /dev/null; then
    echo "Nginx is installed. You may need to configure it to serve the frontend."
    echo "Example nginx configuration for your site:"
    echo "
server {
    listen 80;
    server_name billing-system.duong.casa;

    location / {
        root $REMOTE_PATH/dist;
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
"
  else
    echo "Nginx is not installed. You'll need to set up a web server to serve the frontend."
  fi
  
  # Show the deployed files
  echo ""
  echo "=== Deployed files ==="
  ls -la $REMOTE_PATH/dist
EOF

echo ""
echo "Deployment completed. Check the output above for status."
rm -f frontend-deploy.tar.gz 