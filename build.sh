
#!/bin/bash

# Create dist directory if it doesn't exist
mkdir -p dist

# Copy all files to dist directory
cp -r src/* dist/

# Create a zip file for distribution
cd dist
zip -r ../promptflow-extension.zip .
cd ..

echo "Build completed! The extension is ready in promptflow-extension.zip"
