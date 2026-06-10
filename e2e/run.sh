#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

rm -f *.tgz

echo "> Building..."
bun run build

echo "> Packing..."
TARBALL=$(npm pack 2>/dev/null | tail -1)

echo "> Installing e2e dependencies..."
cd e2e
rm -rf node_modules bun.lock

bun install

echo "> Installing packed tarball: ../$TARBALL"
bun add "@allynet/ishod@file:../$TARBALL"

echo "> Running e2e typecheck + tests..."
bun run test:all

echo "> E2E tests passed!"
