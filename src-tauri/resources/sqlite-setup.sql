CREATE TABLE asset (
    uuid TEXT UNIQUE ON CONFLICT ROLLBACK NOT NULL,
    name TEXT NOT NULL,
    last_update TEXT
);

CREATE VIRTUAL TABLE asset_fts using fts5(uuid, name, content=asset, content_rowid=rowid);

CREATE TABLE tag (
    text TEXT UNIQUE ON CONFLICT ROLLBACK NOT NULL 
);

CREATE VIRTUAL TABLE tag_fts USING fts5(text, content=tag, content_rowid=rowid);

CREATE TABLE tag_to_asset (
    asset_id REFERENCES asset (rowid),
    tag_id REFERENCES tag (rowid),
    PRIMARY KEY (asset_id, tag_id) ON CONFLICT ROLLBACK
);

CREATE TABLE asset_file (
    uuid TEXT UNIQUE ON CONFLICT ROLLBACK NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    extension TEXT NOT NULL,
    last_update TEXT
);

CREATE TABLE asset_to_asset_file (
    asset_id REFERENCES asset (uuid),
    asset_file_id REFERENCES asset_file (uuid),
    PRIMARY KEY (asset_id, asset_file_id) ON CONFLICT ROLLBACK
);