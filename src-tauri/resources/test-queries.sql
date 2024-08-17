SELECT asset.* 
FROM asset JOIN asset_fts 
    ON asset_fts.rowid = asset.rowid
WHERE asset_fts MATCH 'uuid:"d6a6f4c5-9153-4240-bb8a-90be99ff4250" OR name:"d6a6f4c5-9153-4240-bb8a-90be99ff4250"';