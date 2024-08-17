-- ASSET TABLE

CREATE TABLE IF NOT EXISTS asset (
    uuid TEXT UNIQUE ON CONFLICT ROLLBACK NOT NULL,
    name TEXT NOT NULL,
    last_update TEXT
);

CREATE VIRTUAL TABLE IF NOT EXISTS asset_fts using fts5(uuid, name, tokenize=trigram, content=asset, content_rowid=rowid);

CREATE TRIGGER IF NOT EXISTS asset_ai AFTER INSERT ON asset BEGIN
  INSERT INTO asset_fts(rowid, uuid, name) VALUES (new.rowid, new.uuid, new.name);
END;
CREATE TRIGGER IF NOT EXISTS asset_ad AFTER DELETE ON asset BEGIN
  INSERT INTO asset_fts(asset_fts, rowid, uuid, name) VALUES('delete', old.rowid, old.uuid, old.name);
END;
CREATE TRIGGER IF NOT EXISTS asset_au AFTER UPDATE ON asset BEGIN
  INSERT INTO asset_fts(asset_fts, rowid, uuid, name) VALUES('delete', old.rowid, old.uuid, old.name);
  INSERT INTO asset_fts(rowid, uuid, name) VALUES (new.rowid, new.uuid, new.name);
END;

-- TAG TABLE

CREATE TABLE IF NOT EXISTS tag (
    text TEXT UNIQUE ON CONFLICT ROLLBACK NOT NULL 
);

CREATE VIRTUAL TABLE IF NOT EXISTS tag_fts USING fts5(text, tokenize=trigram, content=tag, content_rowid=rowid);

CREATE TRIGGER IF NOT EXISTS tag_ai AFTER INSERT ON tag BEGIN
  INSERT INTO tag_fts(rowid, text) VALUES (new.rowid, new.text);
END;
CREATE TRIGGER IF NOT EXISTS tag_ad AFTER DELETE ON tag BEGIN
  INSERT INTO tag_fts(tag_fts, rowid, text) VALUES('delete', old.rowid, old.text);
END;
CREATE TRIGGER IF NOT EXISTS tag_au AFTER UPDATE ON tag BEGIN
  INSERT INTO tag_fts(tag_fts, rowid, text) VALUES('delete', old.rowid, old.text);
  INSERT INTO tag_fts(rowid, text) VALUES (new.rowid, new.text);
END;

-- ASSET FILE TABLE

CREATE TABLE IF NOT EXISTS asset_file (
    uuid TEXT UNIQUE ON CONFLICT ROLLBACK NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    extension TEXT NOT NULL,
    last_update TEXT
);

-- ASSOCIATION TABLES

CREATE TABLE IF NOT EXISTS tag_to_asset (
    asset_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (asset_id, tag_id) ON CONFLICT ROLLBACK
);

CREATE TABLE IF NOT EXISTS asset_to_asset_file (
    asset_id INTEGER,
    asset_file_id INTEGER,
    PRIMARY KEY (asset_id, asset_file_id) ON CONFLICT ROLLBACK
);