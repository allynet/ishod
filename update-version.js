/* v8 ignore */
import fs from "node:fs";
import path from "node:path";

const packageJsonPath = path.join(import.meta.dirname, "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

if (process.argv.length !== 3) {
  console.error("Usage: node update-version.js <new-version>");
  process.exit(1);
}

const newVersion = process.argv[2];

const isSemver = /^v?(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/;

const newVersionParts = newVersion.match(isSemver);
if (!newVersionParts) {
  console.error(
    "Invalid version, must be a valid semver version or a prerelease version",
  );
  process.exit(1);
}

const oldVersionParts = String(packageJson.version).match(isSemver);
if (!oldVersionParts) {
  console.error(
    "Invalid old version, something is wrong with the package.json",
  );
  process.exit(1);
}

const {
  major: newMajor,
  minor: newMinor,
  patch: newPatch,
} = newVersionParts.groups;

const {
  major: oldMajor,
  minor: oldMinor,
  patch: oldPatch,
} = oldVersionParts.groups;

if (newMajor < oldMajor) {
  console.error("Major version cannot be decreased");
  process.exit(1);
}

if (newMajor === oldMajor && newMinor < oldMinor) {
  console.error("Minor version cannot be decreased");
  process.exit(1);
}

if (newMajor === oldMajor && newMinor === oldMinor && newPatch < oldPatch) {
  console.error("Patch version cannot be decreased");
  process.exit(1);
}

if (newMajor === oldMajor && newMinor === oldMinor && newPatch === oldPatch) {
  console.error("No changes to the version");
  process.exit(1);
}

packageJson.version = `${newMajor}.${newMinor}.${newPatch}`;
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
