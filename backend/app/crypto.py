import hashlib
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def get_sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()

def derive_key(master_hash: str) -> bytes:
    """Derive a 32-byte AES key from the master hash."""
    return hashlib.sha256(master_hash.encode()).digest()

def encrypt_data(data: bytes, key: bytes) -> bytes:
    """Encrypt data using AES-256-GCM."""
    aesgcm = AESGCM(key)
    nonce = os.urandom(12)
    ciphertext = aesgcm.encrypt(nonce, data, None)
    return nonce + ciphertext

def decrypt_data(enrcypted_data: bytes, key: bytes) -> bytes:
    """Decrypt data using AES-256-GCM."""
    aesgcm = AESGCM(key)
    nonce = enrcypted_data[:12]
    ciphertext = enrcypted_data[12:]
    return aesgcm.decrypt(nonce, ciphertext, None)

def split_into_chunks(data: bytes, chunk_size: int = 1024 * 1024) -> list[bytes]:
    """Split data into chunks of specified size."""
    return [data[i:i + chunk_size] for i in range(0, len(data), chunk_size)]
