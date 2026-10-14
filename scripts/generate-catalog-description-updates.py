#!/usr/bin/env python3
"""Generate a single consolidated Liquibase changelog for all catalog & library updates."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_BASE = ROOT / "src/main/resources/config/liquibase/fake-data/catalog"
PROCESSES_DIR = CATALOG_BASE / "processes"
LIBRARY_DIR = CATALOG_BASE / "library"
PROCESS_CSV = CATALOG_BASE / "process.csv"
OUT = ROOT / "src/main/resources/config/liquibase/changelog/20261016120000_consolidated_catalog.xml"
CHANGELOG_PREFIX = "20261016120000"

PROCESSES = ("scrum", "kanban", "xp", "rup")

REL_INSERTS: list[tuple[str, str, str, list[tuple[int, int]]]] = [
    (
        "rel_activity__required_artifacts",
        "activity_id",
        "required_artifacts_id",
        [(1013, 1), (1002, 2), (3001, 1)],
    ),
    (
        "rel_activity__produced_artifacts",
        "activity_id",
        "produced_artifacts_id",
        [(1013, 2), (1013, 14), (1003, 5), (4004, 5)],
    ),
    (
        "rel_activity__responsible_roles",
        "activity_id",
        "responsible_roles_id",
        [(1013, 1)],
    ),
    (
        "rel_activity__participant_roles",
        "activity_id",
        "participant_roles_id",
        [
            (1013, 6),
            (1013, 2),
            (1013, 9),
            (1003, 9),
            (2002, 9),
            (2008, 9),
            (3001, 9),
            (3004, 9),
        ],
    ),
    (
        "rel_activity__tools",
        "activity_id",
        "tools_id",
        [(1013, 1), (1013, 7), (1013, 3), (1003, 3), (3001, 3), (4004, 3)],
    ),
    (
        "rel_activity__guidelines",
        "activity_id",
        "guidelines_id",
        [(1013, 8)],
    ),
    (
        "rel_activity__templates",
        "activity_id",
        "templates_id",
        [(1013, 1), (1008, 8), (1011, 8), (2008, 8), (4008, 8)],
    ),
]


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle, delimiter=";"))


def insert_rel_sql(table: str, col_a: str, col_b: str, rows: list[tuple[int, int]]) -> list[str]:
    lines: list[str] = []
    for a, b in rows:
        lines.append(
            f"INSERT INTO {table} ({col_a}, {col_b})\n"
            f"SELECT {a}, {b} FROM DUAL WHERE NOT EXISTS ("
            f"SELECT 1 FROM {table} WHERE {col_a} = {a} AND {col_b} = {b});"
        )
    return lines


def main() -> None:
    process_updates = [
        f"UPDATE process SET process_description = '{sql_escape(row['process_description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(PROCESS_CSV)
    ]

    phase_updates: list[str] = []
    activity_statements: list[str] = []

    for name in PROCESSES:
        proc_dir = PROCESSES_DIR / name
        for row in read_csv_rows(proc_dir / "phase.csv"):
            phase_updates.append(
                f"UPDATE phase SET name = '{sql_escape(row['name'])}', "
                f"description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
            )
        for row in read_csv_rows(proc_dir / "activity.csv"):
            aid = int(row["id"])
            nm = sql_escape(row["name"])
            desc = sql_escape(row["description"])
            inp = sql_escape(row["input_criterion"])
            pid = int(row["phase_id"])
            if aid == 1013:
                activity_statements.append(
                    f"INSERT INTO activity (id, name, description, input_criterion, phase_id, created_by, last_modified_by)\n"
                    f"SELECT {aid}, '{nm}', '{desc}', '{inp}', {pid}, 'system', 'system'\n"
                    f"FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM activity WHERE id = {aid});"
                )
            activity_statements.append(
                f"UPDATE activity SET name = '{nm}', description = '{desc}', "
                f"input_criterion = '{inp}' WHERE id = {aid};"
            )

    role_updates = [
        f"UPDATE roles SET description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(LIBRARY_DIR / "roles.csv")
    ]
    artifact_updates = [
        f"UPDATE artifacts SET description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(LIBRARY_DIR / "artifacts.csv")
    ]
    tool_updates = [
        f"UPDATE tools SET description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(LIBRARY_DIR / "tools.csv")
    ]
    guideline_updates = [
        f"UPDATE guidelines SET description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(LIBRARY_DIR / "guidelines.csv")
    ]
    template_updates = [
        f"UPDATE templates SET description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(LIBRARY_DIR / "templates.csv")
    ]

    graph_and_rel_sql: list[str] = [
        "DELETE FROM rel_activity__sub_activities WHERE activity_id = 1001 AND sub_activities_id = 1002;",
        "INSERT INTO rel_activity__sub_activities (activity_id, sub_activities_id)\n"
        "SELECT 1001, 1013 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM rel_activity__sub_activities WHERE activity_id = 1001 AND sub_activities_id = 1013);",
        "INSERT INTO rel_activity__sub_activities (activity_id, sub_activities_id)\n"
        "SELECT 1013, 1002 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM rel_activity__sub_activities WHERE activity_id = 1013 AND sub_activities_id = 1002);",
        "DELETE FROM rel_activity__sub_activities WHERE activity_id = 1009 AND sub_activities_id = 1011;",
        "INSERT INTO rel_activity__sub_activities (activity_id, sub_activities_id)\n"
        "SELECT 1010, 1011 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM rel_activity__sub_activities WHERE activity_id = 1010 AND sub_activities_id = 1011);",
        "DELETE FROM rel_activity__sub_activities WHERE activity_id = 3003 AND sub_activities_id = 3009;",
        "INSERT INTO rel_activity__sub_activities (activity_id, sub_activities_id)\n"
        "SELECT 3001, 3009 FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM rel_activity__sub_activities WHERE activity_id = 3001 AND sub_activities_id = 3009);",
        "DELETE FROM rel_activity__required_artifacts WHERE activity_id = 1002 AND required_artifacts_id = 1;",
    ]
    for table, col_a, col_b, rows in REL_INSERTS:
        graph_and_rel_sql.extend(insert_rel_sql(table, col_a, col_b, rows))

    xml_parts = [
        '<?xml version="1.0" encoding="utf-8"?>',
        "<databaseChangeLog",
        '    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"',
        '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        '    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog '
        'http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">',
        "",
        f'    <changeSet id="{CHANGELOG_PREFIX}-1" author="catalog">',
        "        <comment>Processos e fases do catálogo (descrições prático-acadêmicas em pt-BR)</comment>",
        "        <sql>",
        *["            " + line for line in process_updates + phase_updates],
        "        </sql>",
        "    </changeSet>",
        "",
        f'    <changeSet id="{CHANGELOG_PREFIX}-2" author="catalog">',
        "        <comment>Atividades do catálogo (incluindo atividade 1013 do Scrum)</comment>",
        "        <sql>",
        *["            " + line for line in activity_statements],
        "        </sql>",
        "    </changeSet>",
        "",
        f'    <changeSet id="{CHANGELOG_PREFIX}-3" author="catalog">',
        "        <comment>Biblioteca do catálogo: papéis, artefatos, ferramentas, diretrizes e templates</comment>",
        "        <sql>",
        *[
            "            " + line
            for line in role_updates + artifact_updates + tool_updates + guideline_updates + template_updates
        ],
        "        </sql>",
        "    </changeSet>",
        "",
        f'    <changeSet id="{CHANGELOG_PREFIX}-4" author="catalog">',
        "        <comment>Ajustes de precedência (Scrum e XP) e vínculos entre atividades e biblioteca</comment>",
        "        <sql>",
        *["            " + line for line in graph_and_rel_sql],
        "        </sql>",
        "    </changeSet>",
        "",
        "</databaseChangeLog>",
        "",
    ]

    OUT.write_text("\n".join(xml_parts), encoding="utf-8")
    print(f"Wrote consolidated changelog: {OUT}")


if __name__ == "__main__":
    main()
