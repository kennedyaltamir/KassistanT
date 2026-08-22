# Database

Status: DEFINED / CURRENT bootstrap.

MVP persistence is SQLite. Timestamps persist in UTC, monetary values use integer cents/BRL, and canonical entities are scoped by store. The audited migration currently establishes only schema metadata; business tables are NOT_IMPLEMENTED.
