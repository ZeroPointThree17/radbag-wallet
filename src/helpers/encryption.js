const _crypto = require('crypto');


export function encrypt (text, masterkey){
    // random initialization vector
    const iv = _crypto.randomBytes(16);
  
    // random salt
    const salt = _crypto.randomBytes(64);
  
    // derive key: 32 byte key length - in assumption the masterkey is a cryptographic and NOT a password there is no need for
    // a large number of iterations. It may can replaced by HKDF
    const key = _crypto.pbkdf2Sync(masterkey, salt, 2145, 32, 'sha512');
  
    // AES 256 GCM Mode
    const cipher = _crypto.createCipheriv('aes-256-gcm', key, iv);
  
    // encrypt the given text
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  
    // extract the auth tag
    const tag = cipher.getAuthTag();
  
    // generate output
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  }

  
export function decrypt (encdata, masterkey){
    // base64 decoding
    const bData = Buffer.from(encdata, 'base64');
  
    // convert data to buffers
    const salt = bData.slice(0, 64);
    const iv = bData.slice(64, 80);
    const tag = bData.slice(80, 96);
    const text = bData.slice(96);
  
    // derive key using; 32 byte key length
    const key = _crypto.pbkdf2Sync(masterkey, salt , 2145, 32, 'sha512');
  
    // AES 256 GCM Mode
    const decipher = _crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
  
    // encrypt the given text
    const decrypted = decipher.update(text, 'binary', 'utf8') + decipher.final('utf8');
  
    return decrypted;
    
  }

  
  export function convertbits (data, frombits, tobits, pad) {
    var acc = 0;
    var bits = 0;
    var ret = [];
    var maxv = (1 << tobits) - 1;
    for (var p = 0; p < data.length; ++p) {
      var value = data[p];
      if (value < 0 || (value >> frombits) !== 0) {
        return null;
      }
      acc = (acc << frombits) | value;
      bits += frombits;
      while (bits >= tobits) {
        bits -= tobits;
        ret.push((acc >> bits) & maxv);
      }
    }
    if (pad) {
      if (bits > 0) {
        ret.push((acc << (tobits - bits)) & maxv);
      }
    } else if (bits >= frombits || ((acc << (tobits - bits)) & maxv)) {
      return null;
    }
    return ret;
  }
