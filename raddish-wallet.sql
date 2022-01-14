
DROP TABLE application;
CREATE TABLE application (
    new_user_flag INTEGER,
    version INTEGER,
    app_pw_enc TEXT
);
INSERT INTO application VALUES(0,10,'pwHash');

DROP TABLE wallet;
CREATE TABLE wallet (
    id INTEGER PRIMARY KEY,
    name TEXT,
    mnemonic_enc TEXT,
    word13_enc TEXT
);
INSERT INTO wallet VALUES(1,'Wallet 1', mnemonic_enc, word13_enc);


CREATE TABLE address (
    wallet_id INTEGER PRIMARY KEY,
    id INTEGER,
    name TEXT,
radix_address TEXT,
publickey TEXT,
privatekey_enc TEXT,
enabled_flag INTEGER
);

DROP TABLE token;
CREATE TABLE token (
    id INTEGER PRIMARY KEY,
    RRI TEXT,
name TEXT,
symbol TEXT,
decimals INTGER,
logo BLOB
);
INSERT INTO token VALUES (1,'xrd_rr1qy5wfsfh','Radix','XRD',18,null);

DROP table wallet_x_token;
CREATE TABLE wallet_x_token (
	id INTEGER PRIMARY KEY,
    walled_id INTEGER,
    token_id INTEGER,
enabled_flag INTEGER
);
INSERT INTO wallet_x_token VALUES(1,1,1);

--1123000000000000000

--1_000_000_000_000_000_000

