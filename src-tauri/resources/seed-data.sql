INSERT INTO tag (text) VALUES ('test'), ('second test'), ('banana'), ('second banana'), ('orange');

INSERT INTO asset (uuid, name, last_update) VALUES (
    'd6a6f4c5-9153-4240-bb8a-90be99ff4250',
    'first asset',
    datetime('now')
), (
    'a494e3fe-d179-4854-9ec1-2cb9706a1900',
    'second asset',
    datetime('now')
), (
    '57519d0b-8e14-4921-8e24-6cce5968efc6',
    'third asset',
    datetime('now')
), (
    'e1adecf5-2e94-4364-a10b-90e38fd6334a',
    'fourth asset',
    datetime('now')
), (
    '3175b1a8-2a3c-4137-b315-4c0378435ac7',
    'fifth asset',
    datetime('now')
);

INSERT INTO tag_to_asset (asset_id, tag_id) VALUES (
    (SELECT rowid FROM asset WHERE uuid = 'd6a6f4c5-9153-4240-bb8a-90be99ff4250'),
    (SELECT rowid FROM tag WHERE text = 'test')
), (
    (SELECT rowid FROM asset WHERE uuid = 'd6a6f4c5-9153-4240-bb8a-90be99ff4250'),
    (SELECT rowid FROM tag WHERE text = 'second test')
);

INSERT INTO tag_to_asset (asset_id, tag_id) VALUES (
    (SELECT rowid FROM asset WHERE uuid = 'a494e3fe-d179-4854-9ec1-2cb9706a1900'),
    (SELECT rowid FROM tag WHERE text = 'banana')
);

INSERT INTO tag_to_asset (asset_id, tag_id) VALUES (
    (SELECT rowid FROM asset WHERE uuid = 'e1adecf5-2e94-4364-a10b-90e38fd6334a'),
    (SELECT rowid FROM tag WHERE text = 'test')
), (
    (SELECT rowid FROM asset WHERE uuid = 'e1adecf5-2e94-4364-a10b-90e38fd6334a'),
    (SELECT rowid FROM tag WHERE text = 'second test')
), (
    (SELECT rowid FROM asset WHERE uuid = 'e1adecf5-2e94-4364-a10b-90e38fd6334a'),
    (SELECT rowid FROM tag WHERE text = 'banana')
), (
    (SELECT rowid FROM asset WHERE uuid = 'e1adecf5-2e94-4364-a10b-90e38fd6334a'),
    (SELECT rowid FROM tag WHERE text = 'second banana')
), (
    (SELECT rowid FROM asset WHERE uuid = 'e1adecf5-2e94-4364-a10b-90e38fd6334a'),
    (SELECT rowid FROM tag WHERE text = 'orange')
);