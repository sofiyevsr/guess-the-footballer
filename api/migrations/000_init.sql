DROP TABLE IF EXISTS room;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS room_session;

CREATE TABLE room (
    id                       TEXT PRIMARY KEY,
    private                  INTEGER NOT NULL,
    size                     INTEGER NOT NULL,
    current_size             INTEGER NOT NULL,
    creator_username         TEXT NOT NULL,
    started_at               TEXT,
    finished_at              TEXT,
    created_at               TEXT NOT NULL,
    FOREIGN KEY (creator_username) REFERENCES session (username)
);

CREATE TABLE session (
    username    TEXT PRIMARY KEY,
    token       TEXT NOT NULL,
    created_at  TEXT NOT NULL
);

CREATE TABLE room_session (
    room_id           TEXT NOT NULL,
    session_username  TEXT NOT NULL,
    FOREIGN KEY (room_id) REFERENCES room (id),
    FOREIGN KEY (session_username) REFERENCES session (username),
    PRIMARY KEY (room_id, session_username)
);
