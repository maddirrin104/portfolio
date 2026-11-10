#!/usr/bin/env bash
set -euo pipefail

artifact_dir=${1:?Pass the built artifact directory}
artifact_dir=$(realpath "$artifact_dir")
test_root=$(mktemp -d)
trap 'rm -rf -- "$test_root"' EXIT
mkdir -p "$test_root/root/releases/old"
printf 'old release\n' > "$test_root/root/releases/old/index.html"
ln -s "$test_root/root/releases/old" "$test_root/root/current"

bash scripts/deploy-release.sh "$artifact_dir" "$test_root/root" 100-1
[[ $(readlink "$test_root/root/current") == "$test_root/root/releases/100-1" ]]
[[ -s $test_root/root/releases/old/index.html ]]
[[ -s $test_root/root/releases/100-1/images/ccdl1-certificate.webp ]]

cp -a "$artifact_dir" "$test_root/incomplete"
rm -- "$test_root/incomplete/images/ccdl1-certificate.webp"
if bash scripts/deploy-release.sh "$test_root/incomplete" "$test_root/root" 100-2; then
  echo 'Incomplete artifact activated unexpectedly.' >&2
  exit 1
fi
[[ $(readlink "$test_root/root/current") == "$test_root/root/releases/100-1" ]]
[[ ! -e $test_root/root/releases/100-2 ]]

mkdir "$test_root/bin"
cat > "$test_root/bin/rsync" <<'EOF'
#!/usr/bin/env bash
/usr/bin/rsync "$@"
destination=${!#}
printf 'corrupt after copy\n' >> "$destination/index.html"
EOF
chmod +x "$test_root/bin/rsync"
if PATH="$test_root/bin:$PATH" bash scripts/deploy-release.sh "$artifact_dir" "$test_root/root" 100-3; then
  echo 'Corrupted copied release activated unexpectedly.' >&2
  exit 1
fi
[[ $(readlink "$test_root/root/current") == "$test_root/root/releases/100-1" ]]
[[ -s $test_root/root/releases/old/index.html ]]
[[ ! -e $test_root/root/.next-100-3 ]]

mkdir -p "$test_root/first/releases"
bash scripts/deploy-release.sh "$artifact_dir" "$test_root/first" 200-1
[[ $(readlink "$test_root/first/current") == "$test_root/first/releases/200-1" ]]
echo 'PASS: first release and switch activated; missing and corrupted artifacts blocked; prior release retained.'
