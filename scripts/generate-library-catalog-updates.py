#!/usr/bin/env python3
"""Deprecated: use scripts/generate-catalog-description-updates.py (consolidated catalog)."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LIBRARY = ROOT / "src/main/resources/config/liquibase/fake-data/catalog/library"
PROCESS_CSV = ROOT / "src/main/resources/config/liquibase/fake-data/catalog/process.csv"
OUT = ROOT / "src/main/resources/config/liquibase/changelog/20261014120000_update_library_catalog.xml"
DESCRIPTIONS_OUT = (
    ROOT / "src/main/resources/config/liquibase/changelog/20261015120000_update_library_ptbr_descriptions.xml"
)

# New relation rows (table, col_a, col_b, rows) — idempotent INSERTs for migrated DBs
REL_INSERTS: list[tuple[str, str, str, list[tuple[int, int]]]] = [
    (
        "rel_activity__participant_roles",
        "activity_id",
        "participant_roles_id",
        [
            (1003, 9),
            (1013, 9),
            (2002, 9),
            (2008, 9),
            (3001, 9),
            (3004, 9),
        ],
    ),
    (
        "rel_activity__produced_artifacts",
        "activity_id",
        "produced_artifacts_id",
        [(1003, 5), (4004, 5)],
    ),
    (
        "rel_activity__tools",
        "activity_id",
        "tools_id",
        [(1003, 3), (1013, 3), (3001, 3), (4004, 3)],
    ),
    (
        "rel_activity__templates",
        "activity_id",
        "templates_id",
        [(1008, 8), (1011, 8), (2008, 8), (4008, 8)],
    ),
]


def sql_escape(value: str) -> str:
    return value.replace("'", "''")


def read_csv_rows(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as handle:
        return list(csv.DictReader(handle, delimiter=";"))


def insert_sql(table: str, col_a: str, col_b: str, rows: list[tuple[int, int]]) -> list[str]:
    lines: list[str] = []
    for a, b in rows:
        lines.append(
            f"INSERT INTO {table} ({col_a}, {col_b})\n"
            f"SELECT {a}, {b} FROM DUAL WHERE NOT EXISTS ("
            f"SELECT 1 FROM {table} WHERE {col_a} = {a} AND {col_b} = {b});"
        )
    return lines


def main() -> None:
    role_updates = [
        f"UPDATE roles SET description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(LIBRARY / "roles.csv")
    ]
    tool_updates = [
        f"UPDATE tools SET description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(LIBRARY / "tools.csv")
    ]
    guideline_updates = [
        f"UPDATE guidelines SET description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(LIBRARY / "guidelines.csv")
    ]
    template_updates = [
        f"UPDATE templates SET description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(LIBRARY / "templates.csv")
    ]
    artifact_updates = [
        f"UPDATE artifacts SET description = '{sql_escape(row['description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(LIBRARY / "artifacts.csv")
    ]
    process_updates = [
        f"UPDATE process SET process_description = '{sql_escape(row['process_description'])}' WHERE id = {row['id']};"
        for row in read_csv_rows(PROCESS_CSV)
    ]

    rel_lines: list[str] = []
    for table, col_a, col_b, rows in REL_INSERTS:
        rel_lines.extend(insert_sql(table, col_a, col_b, rows))

    xml_parts = [
        '<?xml version="1.0" encoding="utf-8"?>',
        "<databaseChangeLog",
        '    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"',
        '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        '    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog '
        'http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">',
        "",
        '    <changeSet id="20261014120000-1" author="catalog">',
        "        <comment>Library: roles, tools, guidelines, templates</comment>",
        "        <sql>",
        *["            " + line for line in role_updates + tool_updates + guideline_updates + template_updates],
        "        </sql>",
        "    </changeSet>",
        "",
        '    <changeSet id="20261014120000-2" author="catalog">',
        "        <comment>Library: artifacts</comment>",
        "        <sql>",
        *["            " + line for line in artifact_updates],
        "        </sql>",
        "    </changeSet>",
        "",
        '    <changeSet id="20261014120000-3" author="catalog">',
        "        <comment>Catalog processes descriptions</comment>",
        "        <sql>",
        *["            " + line for line in process_updates],
        "        </sql>",
        "    </changeSet>",
        "",
        '    <changeSet id="20261014120000-4" author="catalog">',
        "        <comment>Library relations: UX, prototype, Figma, bug report template</comment>",
        "        <sql>",
        *["            " + line for line in rel_lines],
        "        </sql>",
        "    </changeSet>",
        "",
        "</databaseChangeLog>",
        "",
    ]

    OUT.write_text("\n".join(xml_parts), encoding="utf-8")
    print(f"Wrote {OUT}")

    desc_parts = [
        '<?xml version="1.0" encoding="utf-8"?>',
        "<databaseChangeLog",
        '    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"',
        '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        '    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog '
        'http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">',
        "",
        '    <changeSet id="20261015120000-1" author="catalog">',
        "        <comment>Library pt-BR: roles, tools, guidelines, templates</comment>",
        "        <sql>",
        *["            " + line for line in role_updates + tool_updates + guideline_updates + template_updates],
        "        </sql>",
        "    </changeSet>",
        "",
        '    <changeSet id="20261015120000-2" author="catalog">',
        "        <comment>Library pt-BR: artifacts</comment>",
        "        <sql>",
        *["            " + line for line in artifact_updates],
        "        </sql>",
        "    </changeSet>",
        "",
        '    <changeSet id="20261015120000-3" author="catalog">',
        "        <comment>Catalog processes pt-BR</comment>",
        "        <sql>",
        *["            " + line for line in process_updates],
        "        </sql>",
        "    </changeSet>",
        "",
        "</databaseChangeLog>",
        "",
    ]
    DESCRIPTIONS_OUT.write_text("\n".join(desc_parts), encoding="utf-8")
    print(f"Wrote {DESCRIPTIONS_OUT}")


if __name__ == "__main__":
    main()
