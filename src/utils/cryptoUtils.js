import crypto from "node:crypto"

export const secretKey = crypto
    .createHash('sha256')
    .update('my-very-secure-static-key')
    .digest();


export const encrypt = (text, key) => {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted
    };
}

export const decrypt = (encryptedData, iv, key) => {
    const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        key,
        Buffer.from(iv, 'hex')
    );

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}
