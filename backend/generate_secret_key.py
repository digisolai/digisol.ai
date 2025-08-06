#!/usr/bin/env python3
"""
Generate a secure SECRET_KEY for Django production.
"""

import secrets
import string

def generate_secret_key(length=50):
    """Generate a secure secret key."""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    # Remove characters that might cause issues in environment variables
    alphabet = alphabet.replace('"', '').replace("'", '').replace('\\', '')
    
    secret_key = ''.join(secrets.choice(alphabet) for _ in range(length))
    return secret_key

if __name__ == '__main__':
    secret_key = generate_secret_key(50)
    print(f"Generated SECRET_KEY: {secret_key}")
    print(f"Length: {len(secret_key)} characters")
    print("\nAdd this to your Render environment variables:")
    print(f"SECRET_KEY={secret_key}") 