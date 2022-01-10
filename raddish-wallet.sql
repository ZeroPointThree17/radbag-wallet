CREATE TABLE application (
    new_user_flag INTEGER,
    version INTEGER,
    txn_pin_enc TEXT,
    salt INTEGER
);

CREATE TABLE wallet (
    id INTEGER,
    name TEXT,
    mnemonic_enc TEXT
);

CREATE TABLE address (
    wallet_id INTEGER,
    id INTEGER,
    name TEXT,
radix_address TEXT,
publickey TEXT,
privatekey_enc TEXT,
enabled_flag INTEGER
);

CREATE TABLE address (
    id INTEGER,
    RRI TEXT,
name TEXT,
decimals INTGER,
logo BLOB
);

CREATE TABLE address (
    walled_id INTEGER,
    token_id INTEGER,
enabled_flag INTEGER
);

