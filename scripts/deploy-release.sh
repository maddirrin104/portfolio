#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo 'Usage: deploy-release.sh ARTIFACT_DIR DEPLOY_ROOT RUN_ID-ATTEMPT' >&2
  exit 2
fi

artifact_dir=$1
deploy_root=$2
release_id=$3
if [[ ! $release_id =~ ^[0-9]+-[0-9]+$ ]]; then
  echo 'Release ID must be a numeric GitHub run ID and attempt.' >&2
  exit 2
fi

release_dir="$deploy_root/releases/$release_id"
next_link="$deploy_root/.next-$release_id"
current_link="$deploy_root/current"

for command in rsync sha256sum find; do
  command -v "$command" >/dev/null || { echo "Missing command: $command" >&2; exit 1; }
done
[[ -d $artifact_dir && -s $artifact_dir/SHA256SUMS ]] || { echo 'Missing artifact or checksums.' >&2; exit 1; }
[[ -d $deploy_root/releases && -w $deploy_root/releases && -w $deploy_root ]] || { echo 'Deployment root is not writable by the runner.' >&2; exit 1; }
[[ ! -e $release_dir && ! -L $release_dir && ! -e $next_link && ! -L $next_link ]] || { echo 'Release ID already exists.' >&2; exit 1; }
[[ ! -e $current_link || -L $current_link ]] || { echo 'Current must be a symlink or absent.' >&2; exit 1; }
[[ -z $(find "$artifact_dir" -type l -print -quit) ]] || { echo 'Artifact contains an unexpected symlink.' >&2; exit 1; }

for required in index.html about/index.html projects/soc-homelab/index.html projects/egis/index.html images/ccdl1-badge.webp images/ccdl1-certificate.webp icons/github-invertocat-white.svg icons/linkedin-in-white.png; do
  [[ -s $artifact_dir/$required ]] || { echo "Missing artifact file: $required" >&2; exit 1; }
done
(cd "$artifact_dir" && sha256sum --check --quiet SHA256SUMS)

mkdir "$release_dir"
rsync -a --chmod=D755,F644 "$artifact_dir/" "$release_dir/"
(cd "$release_dir" && sha256sum --check --quiet SHA256SUMS)
[[ -s $release_dir/index.html && -s $release_dir/images/ccdl1-certificate.webp ]] || { echo 'Release verification failed.' >&2; exit 1; }

ln -s "$release_dir" "$next_link"
trap '[[ ! -L $next_link ]] || rm -- "$next_link"' EXIT
mv -Tf "$next_link" "$current_link"
trap - EXIT

echo "Active release: $release_id"
