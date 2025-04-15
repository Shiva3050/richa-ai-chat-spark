
#!/bin/bash

# Build the application
echo "Building the application..."
npm run build

# Create or update gh-pages branch
echo "Deploying to GitHub Pages..."
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages

echo "Deployment complete!"
