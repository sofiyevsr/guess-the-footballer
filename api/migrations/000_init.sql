DROP TABLE IF EXISTS room;
DROP TABLE IF EXISTS session;

CREATE TABLE room (
    id                       TEXT PRIMARY KEY,
    private                  INTEGER NOT NULL,
    size                     INTEGER NOT NULL,
    current_size             INTEGER NOT NULL,
    creator_username         TEXT NOT NULL,
    difficulty               TEXT NOT NULL,
    started_at               INTEGER,
    finished_at              INTEGER,
    created_at               INTEGER NOT NULL,
    FOREIGN KEY (creator_username) REFERENCES session (username)
);

CREATE TABLE session (
    username    TEXT PRIMARY KEY,
    token       TEXT NOT NULL,
    created_at  INTEGER NOT NULL
);
