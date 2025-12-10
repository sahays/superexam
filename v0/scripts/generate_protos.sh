#!/bin/bash
set -e

echo "Activating protoc_plugin..."
flutter pub global activate protoc_plugin

export PATH="$PATH":"$HOME/.pub-cache/bin"

echo "Creating output directory..."
mkdir -p frontend/lib/proto

echo "Generating Dart code from protos..."
protoc --dart_out=grpc:frontend/lib/proto -Iproto proto/*.proto

echo "Done."
