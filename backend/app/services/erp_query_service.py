from __future__ import annotations

from typing import Any

from sqlalchemy import text

from app.database.erp_connection import get_erp_db


class ERPQueryService:
    def scalar(self, sql: str, params: dict[str, Any] | None = None) -> float:
        try:
            db_gen = get_erp_db()
            db = next(db_gen)
            if db is None:
                return 0.0
            
            try:
                result = db.execute(text(sql), params or {}).scalar()
                return float(result or 0)
            finally:
                db.close()
        except (StopIteration, Exception):
            return 0.0

    def fetch_all(self, sql: str, params: dict[str, Any] | None = None) -> list[dict[str, Any]]:
        try:
            db_gen = get_erp_db()
            db = next(db_gen)
            if db is None:
                return []
                
            try:
                rows = db.execute(text(sql), params or {}).mappings().all()
                normalized_rows: list[dict[str, Any]] = []

                for row in rows:
                    normalized_row: dict[str, Any] = {}
                    for key, value in dict(row).items():
                        normalized_row[str(key).upper()] = value
                    normalized_rows.append(normalized_row)

                return normalized_rows
            finally:
                db.close()
        except (StopIteration, Exception):
            return []

    def fetch_one(self, sql: str, params: dict[str, Any] | None = None) -> dict[str, Any] | None:
        rows = self.fetch_all(sql, params)
        if not rows:
            return None
        return rows[0]

    def empresa_filter(
        self,
        field_name: str,
        empresa_id: int | None,
    ) -> tuple[str, dict[str, Any]]:
        if empresa_id is None:
            return "", {}

        return f" AND {field_name} = :empresa_id ", {"empresa_id": empresa_id}