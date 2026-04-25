#!/usr/bin/env python3
"""Commit automatique et push vers GitHub (origin main).

Dépôt  : https://github.com/halalopenfoodfacts-server/magrebmarket
Remote : git@github-maghreb:halalopenfoodfacts-server/magrebmarket.git
Clé SSH: ~/.ssh/maghreb_market_deploy  (deploy key Read/Write ajoutée le 25/04/2026)

Usage :
    python scripts/commit_push.py
    python scripts/commit_push.py -m "mon message de commit"
    python scripts/commit_push.py --no-push   # commit seulement, sans push
"""

from __future__ import annotations

import argparse
import os
import subprocess
import sys
from datetime import datetime
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

# ── Configuration GitHub ────────────────────────────────────────────────────
GITHUB_REPO   = "halalopenfoodfacts-server/magrebmarket"
REMOTE_NAME   = "origin"
REMOTE_URL    = f"git@github-maghreb:{GITHUB_REPO}.git"
BRANCH        = "main"
SSH_KEY_PATH  = Path.home() / ".ssh" / "maghreb_market_deploy"
SSH_HOST_ALIAS = "github-maghreb"   # défini dans ~/.ssh/config
# ───────────────────────────────────────────────────────────────────────────


def run(cmd: list[str], cwd: Path = PROJECT_ROOT, extra_env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    """Exécute une commande et retourne le résultat."""
    env = os.environ.copy()
    if extra_env:
        env.update(extra_env)
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, check=False, env=env)


def check_git_repo() -> None:
    result = run(["git", "rev-parse", "--is-inside-work-tree"])
    if result.returncode != 0:
        raise SystemExit("❌ Ce dossier n'est pas un dépôt git.")


def check_ssh_key() -> None:
    """Vérifie que la deploy key existe localement."""
    if not SSH_KEY_PATH.exists():
        raise SystemExit(
            f"❌ Clé SSH introuvable : {SSH_KEY_PATH}\n"
            "   Régénérez-la avec :\n"
            f"   ssh-keygen -t ed25519 -C deploy@maghreb-market -f {SSH_KEY_PATH} -N ''"
        )


def ensure_remote() -> None:
    """Crée ou corrige le remote pour pointer vers le bon dépôt GitHub."""
    result = run(["git", "remote", "get-url", REMOTE_NAME])
    if result.returncode != 0:
        # Remote absent → on le crée
        run(["git", "remote", "add", REMOTE_NAME, REMOTE_URL])
        print(f"➕ Remote '{REMOTE_NAME}' créé → {REMOTE_URL}")
    elif result.stdout.strip() != REMOTE_URL:
        # Remote pointe ailleurs → on corrige
        run(["git", "remote", "set-url", REMOTE_NAME, REMOTE_URL])
        print(f"🔧 Remote '{REMOTE_NAME}' mis à jour → {REMOTE_URL}")


def get_status() -> str:
    result = run(["git", "status", "--short"])
    return result.stdout.strip()


def stage_all() -> None:
    result = run(["git", "add", "-A"])
    if result.returncode != 0:
        raise SystemExit(f"❌ Erreur lors du staging :\n{result.stderr}")


def generate_message() -> str:
    """Génère un message de commit automatique basé sur les fichiers modifiés."""
    result = run(["git", "diff", "--cached", "--name-only"])
    files = [f.strip() for f in result.stdout.splitlines() if f.strip()]

    areas: list[str] = []
    for f in files:
        if f.startswith("apps/web/app"):
            areas.append("frontend")
        elif f.startswith("apps/api"):
            areas.append("backend")
        elif f.startswith("scripts/"):
            areas.append("scripts")
        elif f.startswith("packages/"):
            areas.append("packages")
        elif f == "README.md":
            areas.append("docs")
        else:
            areas.append("misc")

    dominant = max(set(areas), key=areas.count) if areas else "misc"
    timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
    n = len(files)
    file_summary = ", ".join(files[:3]) + (" …" if n > 3 else "")
    return f"chore({dominant}): mise à jour automatique [{timestamp}] — {n} fichier(s) ({file_summary})"


def commit(message: str) -> None:
    result = run(["git", "commit", "-m", message])
    if result.returncode != 0:
        raise SystemExit(f"❌ Erreur lors du commit :\n{result.stderr or result.stdout}")
    print(result.stdout.strip())


def push() -> None:
    """Pousse vers GitHub en forçant l'utilisation de la deploy key."""
    print(f"⬆️  Push vers github.com/{GITHUB_REPO} (branche {BRANCH})…")

    # Forcer GIT_SSH_COMMAND pour utiliser explicitement notre clé deploy
    ssh_cmd = f"ssh -i {SSH_KEY_PATH} -o IdentitiesOnly=yes -o StrictHostKeyChecking=no"
    result = run(
        ["git", "push", REMOTE_NAME, BRANCH],
        extra_env={"GIT_SSH_COMMAND": ssh_cmd},
    )

    if result.returncode != 0:
        if "no upstream" in result.stderr or "has no upstream" in result.stderr:
            result2 = run(
                ["git", "push", "--set-upstream", REMOTE_NAME, BRANCH],
                extra_env={"GIT_SSH_COMMAND": ssh_cmd},
            )
            if result2.returncode != 0:
                raise SystemExit(f"❌ Erreur push :\n{result2.stderr}")
            print(result2.stdout.strip() or result2.stderr.strip())
        else:
            raise SystemExit(f"❌ Erreur push :\n{result.stderr}")
    else:
        for line in (result.stdout + result.stderr).splitlines():
            if line.strip():
                print(line)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=f"Commit + push automatique → github.com/{GITHUB_REPO}"
    )
    parser.add_argument(
        "-m", "--message",
        default=None,
        help="Message de commit (auto-généré si absent)",
    )
    parser.add_argument(
        "--no-push",
        action="store_true",
        help="Créer le commit sans pousser sur GitHub",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Afficher ce qui serait commité sans rien faire",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    check_git_repo()
    check_ssh_key()
    ensure_remote()

    status = get_status()
    if not status:
        print("✅ Rien à commiter — dépôt propre.")
        return 0

    print("📋 Fichiers modifiés :")
    for line in status.splitlines():
        print(f"   {line}")
    print()

    if args.dry_run:
        msg = args.message or generate_message()
        print(f"🔍 Dry-run — commit qui serait créé :\n   {msg}")
        return 0

    stage_all()

    message = args.message or generate_message()
    print(f"💬 Message : {message}")

    commit(message)
    print("✅ Commit créé.")

    if not args.no_push:
        push()
        print(f"✅ Poussé sur https://github.com/{GITHUB_REPO}")
    else:
        print("ℹ️  Push ignoré (--no-push).")

    return 0


if __name__ == "__main__":
    sys.exit(main())



def run(cmd: list[str], cwd: Path = PROJECT_ROOT) -> subprocess.CompletedProcess[str]:
    """Exécute une commande et retourne le résultat."""
    return subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, check=False)


def check_git_repo() -> None:
    result = run(["git", "rev-parse", "--is-inside-work-tree"])
    if result.returncode != 0:
        raise SystemExit("❌ Ce dossier n'est pas un dépôt git.")


def get_status() -> str:
    result = run(["git", "status", "--short"])
    return result.stdout.strip()


def has_changes() -> bool:
    return bool(get_status())


def stage_all() -> None:
    result = run(["git", "add", "-A"])
    if result.returncode != 0:
        raise SystemExit(f"❌ Erreur lors du staging :\n{result.stderr}")


def generate_message() -> str:
    """Génère un message de commit automatique basé sur les fichiers modifiés."""
    result = run(["git", "diff", "--cached", "--name-only"])
    files = [f.strip() for f in result.stdout.splitlines() if f.strip()]

    # Détecter le type de changement dominant
    areas: list[str] = []
    for f in files:
        if f.startswith("apps/web/app"):
            areas.append("frontend")
        elif f.startswith("apps/api"):
            areas.append("backend")
        elif f.startswith("scripts/"):
            areas.append("scripts")
        elif f.startswith("packages/"):
            areas.append("packages")
        elif f in ("README.md",):
            areas.append("docs")
        else:
            areas.append("misc")

    dominant = max(set(areas), key=areas.count) if areas else "misc"
    timestamp = datetime.now().strftime("%d/%m/%Y %H:%M")
    n = len(files)
    file_summary = ", ".join(files[:3]) + (" …" if n > 3 else "")
    return f"chore({dominant}): mise à jour automatique [{timestamp}] — {n} fichier(s) ({file_summary})"


def commit(message: str) -> None:
    result = run(["git", "commit", "-m", message])
    if result.returncode != 0:
        raise SystemExit(f"❌ Erreur lors du commit :\n{result.stderr or result.stdout}")
    print(result.stdout.strip())


def push() -> None:
    print("⬆️  Push vers origin main…")
    result = run(["git", "push", "origin", "main"])
    if result.returncode != 0:
        # Essayer de définir l'upstream si absent
        if "no upstream" in result.stderr or "has no upstream" in result.stderr:
            result2 = run(["git", "push", "--set-upstream", "origin", "main"])
            if result2.returncode != 0:
                raise SystemExit(f"❌ Erreur push :\n{result2.stderr}")
            print(result2.stdout.strip())
        else:
            raise SystemExit(f"❌ Erreur push :\n{result.stderr}")
    else:
        # Afficher un résumé propre
        for line in result.stderr.splitlines():
            print(line)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Commit + push automatique vers GitHub")
    parser.add_argument(
        "-m", "--message",
        default=None,
        help="Message de commit (auto-généré si absent)",
    )
    parser.add_argument(
        "--no-push",
        action="store_true",
        help="Créer le commit sans pousser sur GitHub",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Afficher ce qui serait commité sans rien faire",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()

    check_git_repo()

    status = get_status()
    if not status:
        print("✅ Rien à commiter — dépôt propre.")
        return 0

    print("📋 Fichiers modifiés :")
    for line in status.splitlines():
        print(f"   {line}")
    print()

    if args.dry_run:
        msg = args.message or generate_message()
        print(f"🔍 Dry-run — commit qui serait créé :\n   {msg}")
        return 0

    stage_all()

    message = args.message or generate_message()
    print(f"💬 Message : {message}")

    commit(message)
    print("✅ Commit créé.")

    if not args.no_push:
        push()
        print("✅ Poussé sur GitHub avec succès.")
    else:
        print("ℹ️  Push ignoré (--no-push).")

    return 0


if __name__ == "__main__":
    sys.exit(main())
