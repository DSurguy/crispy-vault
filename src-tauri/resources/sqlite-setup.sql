CREATE TABLE asset (
    uuid TEXT UNIQUE ON CONFLICT ABORT NOT NULL,
    name TEXT NOT NULL
);

CREATE VIRTUAL TABLE asset_fts using fts5(uuid, name, content=asset, content_rowid=rowid);

CREATE TABLE tag (
    text TEXT NOT NULL
);

CREATE VIRTUAL TABLE tag_fts USING fts5(text, content=tag, content_rowid=rowid);

CREATE TABLE tag_to_asset (
    tag_id REFERENCES tag (rowid),
    asset_id REFERENCES asset (rowid)
);

CREATE TABLE asset_file (
    uuid TEXT UNIQUE ON CONFLICT ABORT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE asset_to_asset_file (
    asset_id REFERENCES asset (uuid),
    asset_file_id REFERENCES asset_file (uuid)
);