#!/usr/bin/env python3
"""Petit utilitaire pour lancer le frontend Next.js et l'API Django."""

from __future__ import annotations

import argparse
import os
import signal
import subprocess
import sys
import time
from collections.abc import Callable
from pathlib import Path
from threading import Event

PROJECT_ROOT = Path(__file__).resolve().parent.parent
API_ROOT = PROJECT_ROOT / "apps" / "api"
WEB_ROOT = PROJECT_ROOT / "apps" / "web"
VENV_DIR_NAME = ".venv"
VENV_ROOTS = (
    PROJECT_ROOT / VENV_DIR_NAME,
    API_ROOT / VENV_DIR_NAME,
)
PYTHON_SUBPATHS = (Path("bin") / "python", Path("Scripts") / "python.exe")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Démarre l'environnement de développement Maghreb Market"
    )
    parser.add_argument(
        "--frontend",
        action="store_true",
        help="Ne démarrer que le frontend Next.js",
    )
    parser.add_argument(
        "--backend",
        action="store_true",
        help="Ne démarrer que l'API Django",
    )
    parser.add_argument(
        "--frontend-port",
        type=int,
        default=3000,
        help="Port du frontend Next.js (défaut: 3000)",
    )
    parser.add_argument(
        "--backend-port",
        type=int,
        default=4000,
        help="Port du backend Django (défaut: 4000)",
    )
    parser.add_argument(
        "--force-free-ports",
        action="store_true",
        help="Libère les ports frontend/backend s'ils sont déjà occupés avant le démarrage.",
    )
    return parser.parse_args()


def get_listening_pids(port: int) -> list[int]:
    probe = subprocess.run(
        ["lsof", "-tiTCP:{port}".format(port=port), "-sTCP:LISTEN"],
        capture_output=True,
        text=True,
        check=False,
    )
    if probe.returncode not in (0, 1):
        return []

    pids: list[int] = []
    for raw in probe.stdout.splitlines():
        line = raw.strip()
        if not line:
            continue
        try:
            pids.append(int(line))
        except ValueError:
            continue
    return pids


def pid_command(pid: int) -> str:
    probe = subprocess.run(
        ["ps", "-p", str(pid), "-ww", "-o", "command="],
        capture_output=True,
        text=True,
        check=False,
    )
    return probe.stdout.strip() or "(commande inconnue)"


def kill_pids(pids: list[int], signum: int) -> None:
    for pid in pids:
        try:
            os.kill(pid, signum)
        except (ProcessLookupError, PermissionError):
            continue


def raise_port_in_use(port: int, label: str, pids: list[int]) -> None:
    details = [f"Port {port} déjà utilisé ({label})."]
    for pid in pids:
        details.append(f"  pid={pid}  cmd={pid_command(pid)}")
    details.extend(
        [
            "",
            "Solutions:",
            "  - relancer avec --force-free-ports",
            f"  - ou tuer manuellement: kill {' '.join(str(pid) for pid in pids)}",
        ]
    )
    raise SystemExit("\n".join(details))


def force_free_port(port: int, label: str, pids: list[int]) -> None:
    print(f"⚠️  Port {port} déjà utilisé pour {label}; arrêt des processus: {', '.join(map(str, pids))}")
    kill_pids(pids, signal.SIGTERM)
    time.sleep(0.5)
    remaining = get_listening_pids(port)
    kill_pids(remaining, signal.SIGKILL)

    if get_listening_pids(port):
        raise SystemExit(
            f"Impossible de libérer le port {port} ({label}). Fermez le processus manuellement puis relancez."
        )


def ensure_port_available(port: int, label: str, force: bool) -> None:
    pids = get_listening_pids(port)
    if not pids:
        return

    if force:
        force_free_port(port, label, pids)
        return

    raise_port_in_use(port, label, pids)


def resolve_backend_python() -> str:
    """Prend le binaire Python du projet (priorité au venv local)."""

    candidates = [root / subpath for root in VENV_ROOTS for subpath in PYTHON_SUBPATHS]

    for candidate in candidates:
        if candidate.exists():
            return str(candidate)

    return sys.executable


def ensure_django_available(python_bin: str) -> None:
    """Vérifie que Django est importable avant de lancer le serveur."""

    probe = subprocess.run(
        [python_bin, "-c", "import django"],
        capture_output=True,
        text=True,
        check=False,
    )

    if probe.returncode == 0:
        return

    details = (probe.stderr or probe.stdout or "").strip()
    hint = [
        "Impossible d'importer Django avec l'interpréteur suivant:",
        f"  {python_bin}",
        "",
        "Activez l'environnement virtuel du projet (source .venv/bin/activate)",
        "ou installez les dépendances backend avec:",
        "  python -m pip install -r apps/api/requirements.txt",
    ]
    if details:
        hint.extend(["", "Sortie de la commande:", details])

    raise SystemExit("\n".join(hint))


def resolve_frontend_command(port: int) -> list[str]:
    web_dir = str(WEB_ROOT)
    web_next_bin = WEB_ROOT / "node_modules" / ".bin" / "next"
    if web_next_bin.exists():
        return [str(web_next_bin), "dev", web_dir, "-p", str(port)]

    root_next_bin = PROJECT_ROOT / "node_modules" / ".bin" / "next"
    if root_next_bin.exists():
        return [str(root_next_bin), "dev", web_dir, "-p", str(port)]

    return ["npm", "run", "dev:web", "--", "-p", str(port)]


def build_commands(args: argparse.Namespace) -> list[tuple[str, list[str], Path]]:
    targets: list[str]
    if args.frontend or args.backend:
        targets = [t for t, enabled in (("frontend", args.frontend), ("backend", args.backend)) if enabled]
    else:
        targets = ["frontend", "backend"]

    commands: list[tuple[str, list[str], Path]] = []
    if "frontend" in targets:
        ensure_port_available(args.frontend_port, "frontend", args.force_free_ports)
        next_command = resolve_frontend_command(args.frontend_port)
        commands.append(
            (
                "frontend",
                next_command,
                PROJECT_ROOT,
            )
        )
    if "backend" in targets:
        ensure_port_available(args.backend_port, "backend", args.force_free_ports)
        backend_python = resolve_backend_python()
        ensure_django_available(backend_python)
        commands.append(
            (
                "backend",
                [backend_python, str(API_ROOT / "manage.py"), "runserver", f"0.0.0.0:{args.backend_port}"],
                API_ROOT,
            )
        )

    if not commands:
        raise SystemExit("Aucune cible sélectionnée. Utilisez --frontend, --backend ou aucun argument pour tout lancer.")

    return commands


def launch_processes(
    commands: list[tuple[str, list[str], Path]], env: dict[str, str]
) -> list[tuple[str, subprocess.Popen[bytes]]]:
    processes: list[tuple[str, subprocess.Popen[bytes]]] = []
    for name, cmd, cwd in commands:
        print(f"▶️  Lancement {name} — {' '.join(cmd)} (cwd={cwd})")
        processes.append((name, subprocess.Popen(cmd, cwd=cwd, env=env)))
    return processes


def terminate_running_processes(processes: list[tuple[str, subprocess.Popen[bytes]]]) -> None:
    for name, proc in processes:
        if proc.poll() is None:
            print(f"⏹  Arrêt de {name}…")
            proc.terminate()


def monitor_processes(
    processes: list[tuple[str, subprocess.Popen[bytes]]],
    stop_event: Event,
    terminate_callback: Callable[[], None],
) -> None:
    while not stop_event.is_set():
        for name, proc in processes:
            code = proc.poll()
            if code is not None:
                print(f"{name} s'est terminé avec le code {code}.")
                stop_event.set()
                terminate_callback()
                return
        time.sleep(0.5)


def shutdown_processes(processes: list[tuple[str, subprocess.Popen[bytes]]]) -> None:
    for name, proc in processes:
        if proc.poll() is None:
            try:
                proc.wait(timeout=5)
            except subprocess.TimeoutExpired:
                print(f"Forçage de l'arrêt de {name}…")
                proc.kill()


def main() -> int:
    args = parse_args()
    commands = build_commands(args)
    stop_event = Event()
    env = os.environ.copy()
    processes = launch_processes(commands, env)

    def terminate_processes() -> None:
        terminate_running_processes(processes)

    def handle_signal(signum: int, _: object) -> None:  # noqa: ARG001
        print(f"Signal {signum} reçu, arrêt en cours…")
        stop_event.set()
        terminate_processes()

    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    try:
        monitor_processes(processes, stop_event, terminate_processes)
    finally:
        shutdown_processes(processes)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
