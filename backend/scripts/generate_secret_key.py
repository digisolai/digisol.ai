#!/usr/bin/env python3
"""
Script to generate a secure Django secret key for production deployment.
"""

import secrets
import string

def generate_secret_key(length=50):
    """Generate a secure secret key with specified length."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    # Remove characters that might cause issues in environment variables
    alphabet = alphabet.replace('"', '').replace("'", '').replace('\\', '')
    
    secret_key = ''.join(secrets.choice(alphabet) for _ in range(length))
    return secret_key

if __name__ == '__main__':
    secret_key = generate_secret_key(64)  # Generate 64 character key
    print("Generated Django Secret Key:")
    print(f"SECRET_KEY={secret_key}")
    print("\nAdd this to your .env.production file")
    print("Make sure to keep this key secure and never commit it to version control!") 