# LoRA Studio - Master Development Prompt

## Project Overview

You are building **LoRA Studio**, a secure desktop application for training LoRA (Low-Rank Adaptation) models for Stable Diffusion. This is a security-critical application that handles sensitive credentials, user data, and GPU resources.

## Core Requirements

### What You're Building

A cross-platform desktop app (Electron + Python) that:
1. Imports and manages image datasets
2. Auto-generates captions using BLIP/WD14
3. Configures LoRA training parameters
4. Executes training locally or in the cloud
5. Validates and exports trained models

### Non-Negotiable Security Principles

Every line of code must adhere to these principles:

1. **Zero Trust Architecture** - Never trust user input, network data, or external processes
2. **Defense in Depth** - Multiple security layers for each threat
3. **Least Privilege** - Minimum permissions required for each operation
4. **Secure by Default** - All security features enabled, no insecure fallbacks
5. **Fail Secure** - Errors should not expose sensitive information or bypass security

---

## Technical Stack

```
Frontend:  React 18 + TypeScript + Vite
Desktop:   Electron 28+ (latest stable)
Backend:   Python 3.11+
Training:  Kohya SS scripts, Hugging Face Diffusers
Database:  SQLite with SQLCipher encryption
IPC:       Electron IPC with strict typing
```

---

## Security Implementation Checklist

### Authentication System

```python
# Password hashing
- Algorithm: Argon2id
- Parameters: time_cost=3, memory_cost=65536, parallelism=4
- Salt: 16 bytes cryptographically random

# Session management
- JWT with RS256 signing (2048-bit RSA minimum)
- Access token: 15 minute expiry
- Refresh token: 7 day expiry, rotating
- Token binding to device fingerprint

# MFA
- TOTP with 30-second windows (RFC 6238)
- Recovery codes: 10 single-use codes, bcrypt hashed
- WebAuthn support for hardware keys
```

### Encryption Implementation

```python
# Data at rest (AES-256-GCM)
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
import os

class EncryptedStorage:
    def __init__(self):
        # Master key from OS keychain
        self.master_key = self._get_from_keychain()
    
    def encrypt(self, plaintext: bytes) -> tuple[bytes, bytes, bytes]:
        aesgcm = AESGCM(self.master_key)
        nonce = os.urandom(12)  # 96-bit nonce for GCM
        ciphertext = aesgcm.encrypt(nonce, plaintext, None)
        return nonce, ciphertext, self._compute_tag(ciphertext)
    
    def _get_from_keychain(self) -> bytes:
        # Platform-specific keychain access
        if sys.platform == 'win32':
            return self._windows_credential_manager()
        elif sys.platform == 'darwin':
            return self._macos_keychain()
        else:
            return self._linux_libsecret()

# Key derivation for encryption keys
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=600000,  # OWASP recommendation
    )
    return kdf.derive(password.encode())
```

### Input Validation Framework

```python
from pydantic import BaseModel, Field, validator
from typing import Literal
import re

class TrainingConfig(BaseModel):
    # Strict type validation
    batch_size: int = Field(ge=1, le=128)
    learning_rate: float = Field(ge=1e-8, le=1.0)
    epochs: int = Field(ge=1, le=10000)
    
    # Allowlist validation
    optimizer: Literal["adamw", "sgd", "adamw8bit"] = "adamw8bit"
    lr_scheduler: Literal["constant", "cosine", "linear"] = "cosine"
    
    # Custom validation
    @validator('network_alpha')
    def validate_alpha(cls, v, values):
        if v > values['network_rank']:
            raise ValueError('alpha should not exceed rank')
        return v
    
    # Path validation - prevent traversal
    @validator('output_dir')
    def validate_output_path(cls, v):
        resolved = Path(v).resolve()
        base = Path ConfigSettings.output_base
        if not str(resolved).startswith(str(base)):
            raise ValueError('Output path must be within allowed directory')
        return str(resolved)

class ImageUpload(BaseModel):
    filename: str
    content_type: str
    size: int
    data: bytes
    
    @validator('filename')
    def sanitize_filename(cls, v):
        # Remove path components
        v = Path(v).name
        # Allow only safe characters
        if not re.match(r'^[\w\-. ]+$', v):
            raise ValueError('Invalid filename characters')
        return v
    
    @validator('content_type')
    def validate_content_type(cls, v):
        allowed = ['image/jpeg', 'image/png', 'image/webp']
        if v not in allowed:
            raise ValueError('Only JPEG, PNG, and WebP allowed')
        return v
```

### Secure Subprocess Execution

```python
import subprocess
from typing import List

# NEVER do this - vulnerable to command injection
# BAD:
def train_bad(user_params: str):
    os.system(f"python train.py {user_params}")  # COMMAND INJECTION!

# NEVER do this either - still vulnerable
# BAD:
def train_also_bad(user_params: str):
    subprocess.run(f"python train.py {user_params}", shell=True)  # STILL VULNERABLE!

# DO THIS - secure subprocess with argument array
# GOOD:
def train_secure(params: TrainingConfig) -> subprocess.CompletedProcess:
    # Whitelist of allowed parameters
    allowed_args = {
        'batch_size': '--batch_size',
        'learning_rate': '--learning_rate', 
        'epochs': '--max_train_epochs',
        'network_rank': '--network_rank',
        'network_alpha': '--network_alpha',
    }
    
    cmd: List[str] = ['python', 'train_network.py']
    
    # Build command from validated config, not string interpolation
    for field, arg_name in allowed_args.items():
        value = getattr(params, field)
        cmd.append(f'{arg_name}={value}')
    
    # CRITICAL: shell=False prevents shell injection
    return subprocess.run(
        cmd,
        shell=False,
        capture_output=True,
        text=True,
        timeout=params.epochs * 3600,  # Reasonable timeout
        env={**os.environ, 'PYTHONSAFEPATH': '1'}
    )
```

### File Upload Security

```python
import magic  # python-magic for content detection
from PIL import Image
import io

class SecureImageProcessor:
    MAX_SIZE = 500 * 1024 * 1024  # 500MB
    MAX_DIMENSION = 8192
    ALLOWED_FORMATS = {'JPEG', 'PNG', 'WEBP'}
    
    def validate_and_sanitize(self, file_data: bytes) -> Image.Image:
        # 1. Check size
        if len(file_data) > self.MAX_SIZE:
            raise ValueError('File too large')
        
        # 2. Verify magic bytes (not extension!)
        mime = magic.from_buffer(file_data, mime=True)
        if mime not in ['image/jpeg', 'image/png', 'image/webp']:
            raise ValueError('Invalid image type')
        
        # 3. Actually load and validate image
        try:
            img = Image.open(io.BytesIO(file_data))
        except Exception as e:
            raise ValueError(f'Corrupt image: {e}')
        
        # 4. Verify dimensions
        if img.width > self.MAX_DIMENSION or img.height > self.MAX_DIMENSION:
            raise ValueError('Image dimensions too large')
        
        # 5. Re-encode to strip any embedded exploits
        img.verify()  # Verify integrity
        img = Image.open(io.BytesIO(file_data))
        
        # 6. Convert to safe format
        output = io.BytesIO()
        img.save(output, format='PNG', optimize=True)
        
        return Image.open(output)

def validate_zip_safety(zip_path: Path) -> bool:
    """Detect ZIP bombs and malicious archives"""
    MAX_COMPRESSION_RATIO = 20  # 20:1 maximum
    MAX_TOTAL_SIZE = 10 * 1024 * 1024 * 1024  # 10GB
    
    with zipfile.ZipFile(zip_path, 'r') as zf:
        compressed_size = sum(info.compress_size for info in zf.infolist())
        uncompressed_size = sum(info.file_size for info in zf.infolist())
        
        if compressed_size == 0:
            return False
            
        ratio = uncompressed_size / compressed_size
        if ratio > MAX_COMPRESSION_RATIO:
            raise ValueError(f'ZIP bomb detected: compression ratio {ratio:.1f}:1')
        
        if uncompressed_size > MAX_TOTAL_SIZE:
            raise ValueError(f'Archive too large when extracted: {uncompressed_size} bytes')
        
        # Check for path traversal
        for info in zf.infolist():
            if '..' in info.filename or info.filename.startswith('/'):
                raise ValueError('Path traversal attempt detected')
    
    return True
```

### Path Security

```python
from pathlib import Path
import os

class SecurePath:
    """Prevent path traversal and symlink attacks"""
    
    ALLOWED_BASES = [
        Path('/home/user/lora-studio/datasets'),
        Path('/home/user/lora-studio/output'),
        Path('/home/user/lora-studio/models'),
    ]
    
    @classmethod
    def resolve_safe(cls, user_path: str) -> Path:
        """Resolve path securely, preventing traversal"""
        # Convert to absolute path
        path = Path(user_path).resolve(strict=True)
        
        # Check against allowed bases
        for base in cls.ALLOWED_BASES:
            base_resolved = base.resolve()
            try:
                path.relative_to(base_resolved)
                return path
            except ValueError:
                continue
        
        raise ValueError(f'Path {user_path} is outside allowed directories')
    
    @classmethod
    def join_safe(cls, base: Path, *parts: str) -> Path:
        """Safely join path components"""
        result = base
        for part in parts:
            # Strip any path separators from user input
            part = Path(part).name
            result = result / part
        return cls.resolve_safe(str(result))
```

### Network Security

```python
import httpx
from typing import Optional, List

class SecureHTTPClient:
    """Secure HTTP client for API calls"""
    
    def __init__(self, api_token: str):
        self.client = httpx.AsyncClient(
            # Enforce HTTPS
            transport=httpx.AsyncHTTPTransport(
                verify=True,
                http2=True,
            ),
            # Timeout all requests
            timeout=httpx.Timeout(30.0, connect=10.0),
            # Follow redirects but limit
            follow_redirects=True,
            max_redirects=3,
        )
        # Set security headers
        self.client.headers.update({
            'Authorization': f'Bearer {api_token}',
            'Accept': 'application/json',
            'User-Agent': 'LoRA-Studio/1.0',
        })
    
    async def request(self, method: str, endpoint: str, **kwargs) -> httpx.Response:
        # URL validation - only allow expected domains
        allowed_hosts = ['api.huggingface.co', 'api.runpod.io', 'api.vast.ai']
        parsed = httpx.URL(endpoint)
        if parsed.host not in allowed_hosts:
            raise ValueError(f'Host {parsed.host} not in allowlist')
        
        response = await self.client.request(method, endpoint, **kwargs)
        
        # Check for security headers
        if response.url.scheme != 'https':
            raise ValueError('Non-HTTPS response')
        
        return response
```

### Audit Logging

```python
import logging
import hashlib
import json
from datetime import datetime

class AuditLogger:
    """Tamper-evident audit logging"""
    
    def __init__(self, log_path: Path):
        self.logger = logging.getLogger('audit')
        self.logger.setLevel(logging.INFO)
        
        # Handler with secure formatting
        handler = logging.FileHandler(log_path)
        handler.setFormatter(self.SecurityFormatter())
        self.logger.addHandler(handler)
        
        # Hash chain for integrity
        self.last_hash = self._load_last_hash()
    
    def log_event(self, event_type: str, user_id: str, details: dict, 
                  success: bool, ip_address: Optional[str] = None):
        """Log a security-relevant event"""
        
        # NEVER log sensitive data
        safe_details = self._sanitize(details)
        
        log_entry = {
            'timestamp': datetime.utcnow().isoformat(),
            'event_type': event_type,
            'user_id': user_id,
            'success': success,
            'ip_address': self._mask_ip(ip_address) if ip_address else None,
            'details': safe_details,
            'previous_hash': self.last_hash,
        }
        
        # Compute hash for chain integrity
        entry_json = json.dumps(log_entry, sort_keys=True)
        self.last_hash = hashlib.sha256(entry_json.encode()).hexdigest()
        log_entry['entry_hash'] = self.last_hash
        
        self.logger.info(json.dumps(log_entry))
    
    def _sanitize(self, data: dict) -> dict:
        """Remove sensitive fields from logs"""
        sensitive_keys = {'password', 'token', 'secret', 'api_key', 'credential'}
        sanitized = {}
        for key, value in data.items():
            if key.lower() in sensitive_keys:
                sanitized[key] = '[REDACTED]'
            elif isinstance(value, dict):
                sanitized[key] = self._sanitize(value)
            else:
                sanitized[key] = value
        return sanitized
    
    def _mask_ip(self, ip: str) -> str:
        """Mask IP address for privacy"""
        if ':' in ip:  # IPv6
            return ip[:16] + '::****'
        return '.'.join(ip.split('.')[:3]) + '.***'
    
    class SecurityFormatter(logging.Formatter):
        def format(self, record):
            # Add timestamp and prevent log injection
            record.msg = str(record.msg).replace('\n', ' ').replace('\r', ' ')
            return super().format(record)
```

### Container Sandboxing

```python
import docker
from typing import Dict, Optional

class TrainingSandbox:
    """Run training jobs in isolated containers"""
    
    def __init__(self):
        self.client = docker.from_env()
    
    def run_training(self, 
                     image: str,
                     config: TrainingConfig,
                     gpu_id: int,
                     timeout: int = 86400) -> Dict:
        """Execute training in sandboxed container"""
        
        container = self.client.containers.run(
            image=image,
            command=self._build_command(config),
            # Resource limits
            detach=True,
            mem_limit='16g',
            memswap_limit='16g',
            cpu_count=4,
            # GPU access (isolated)
            device_requests=[docker.types.DeviceRequest(
                count=1,
                capabilities=[['gpu']],
                device_ids=[str(gpu_id)]
            )],
            # Network isolation
            network='none',  # No network access during training
            # Filesystem isolation
            volumes={
                config.dataset_path: {'bind': '/data/dataset', 'mode': 'ro'},
                config.output_dir: {'bind': '/output', 'mode': 'rw'},
            },
            # Security options
            security_opt=[
                'no-new-privileges:true',
                'apparmor=docker-default',
            ],
            # Read-only root filesystem
            read_only=True,
            # Temporary filesystem for runtime needs
            tmpfs={
                '/tmp': 'rw,noexec,nosuid,size=1g',
                '/run': 'rw,noexec,nosuid,size=64m',
            },
            # Environment (sanitized)
            environment=self._build_environment(config),
            # User (non-root)
            user='1000:1000',
            # Prevent privilege escalation
            cap_drop=['ALL'],
            # Auto-remove after completion
            remove=True,
        )
        
        # Wait with timeout
        try:
            result = container.wait(timeout=timeout)
            logs = container.logs().decode()
            return {'success': True, 'exit_code': result['StatusCode'], 'logs': logs}
        except Exception as e:
            container.kill()
            return {'success': False, 'error': str(e)}
    
    def _build_command(self, config: TrainingConfig) -> list:
        """Build command from validated config"""
        cmd = ['python', '/app/train_network.py']
        for key, value in config.dict().items():
            cmd.append(f'--{key}={value}')
        return cmd
```

---

## Development Guidelines

### Code Review Checklist

Before any code is merged, verify:

- [ ] All user inputs validated with allowlists
- [ ] No shell=True in subprocess calls
- [ ] Paths validated against allowed directories
- [ ] No credentials in code, logs, or error messages
- [ ] Encryption used for sensitive data
- [ ] Error messages don't leak system information
- [ ] Authentication/authorization checks in place
- [ ] Audit logging for security events
- [ ] Dependencies pinned and verified

### Testing Requirements

```python
import pytest

class TestInputValidation:
    def test_batch_size_bounds(self):
        with pytest.raises(ValidationError):
            TrainingConfig(batch_size=0)
        with pytest.raises(ValidationError):
            TrainingConfig(batch_size=129)
    
    def test_path_traversal_blocked(self):
        with pytest.raises(ValueError):
            SecurePath.resolve_safe('../../../etc/passwd')
    
    def test_command_injection_prevented(self):
        malicious = TrainingConfig(
            batch_size=4,
            learning_rate=1e-4,
            # Attempt injection via parameter
            network_rank="4; rm -rf /"
        )
        # Should fail validation
        assert isinstance(malicious.network_rank, int)

class TestSecurity:
    def test_password_hashing(self):
        # Verify Argon2id parameters
        hash = hash_password("test_password")
        assert hash.startswith('$argon2id$')
    
    def test_encryption_roundtrip(self):
        storage = EncryptedStorage()
        plaintext = b'secret_data'
        nonce, ciphertext, tag = storage.encrypt(plaintext)
        decrypted = storage.decrypt(nonce, ciphertext, tag)
        assert decrypted == plaintext
    
    def test_zip_bomb_detection(self):
        # Create a small file that claims to be huge
        with zipfile.ZipFile('bomb.zip', 'w') as zf:
            # Write a file with small actual size but large declared size
            info = zipfile.ZipInfo('fake.txt')
            info.file_size = 10 * 1024 * 1024 * 1024  # 10GB claimed
            zf.writestr(info, b'small content')
        
        with pytest.raises(ValueError, match='ZIP bomb'):
            validate_zip_safety('bomb.zip')
```

### Error Handling

```python
from typing import Optional

class SecurityError(Exception):
    """Base class for security errors"""
    public_message = "A security error occurred"
    
    def __init__(self, message: str, details: Optional[dict] = None):
        super().__init__(message)
        self.details = details
        # Log full details internally
        audit_logger.log_event('security_error', 'system', 
                              {'internal_message': message, **details}, 
                              success=False)

class AuthenticationError(SecurityError):
    public_message = "Authentication failed"

class AuthorizationError(SecurityError):
    public_message = "Access denied"

class ValidationError(SecurityError):
    public_message = "Invalid input"

# API error responses - never leak internal details
@app.error_handler
def handle_security_error(error: SecurityError):
    return {
        'error': error.public_message,
        'request_id': generate_request_id(),  # For support lookup
    }, 400
```

---

## Threat Model

### Assets to Protect

1. **User Credentials** - HF tokens, cloud API keys, passwords
2. **Training Data** - User's image datasets
3. **Trained Models** - Output LoRA files
4. **GPU Resources** - Prevent unauthorized compute usage
5. **System Integrity** - Prevent code execution attacks

### Threat Actors

1. **Malicious User** - Attempting to access other users' data
2. **Compromised Dependency** - Supply chain attack via packages
3. **Network Attacker** - MITM, credential interception
4. **Malicious Dataset** - Images crafted to exploit vulnerabilities

### Attack Vectors & Mitigations

| Attack | Mitigation |
|--------|------------|
| Command injection via training params | Argument arrays, no shell=True |
| Path traversal in file operations | Path validation against allowlist |
| Credential theft from config files | OS keychain storage only |
| ZIP bomb denial of service | Compression ratio validation |
| Model poisoning | Checksum verification, signing |
| Session hijacking | Secure cookies, token binding |
| Privilege escalation | Container sandboxing, non-root |
| Supply chain attack | Dependency pinning, verification |

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Set up project structure with security-first architecture
2. Implement authentication system with Argon2id + JWT
3. Build encrypted storage layer using OS keychain
4. Create input validation framework with Pydantic

### Phase 2: Core Training (Week 3-4)
1. Integrate Kohya SS training scripts
2. Implement secure subprocess execution
3. Build dataset management with validation
4. Create training job sandboxing

### Phase 3: Cloud Integration (Week 5-6)
1. Add RunPod/Vast.ai API integration
2. Implement secure credential rotation
3. Build encrypted tunnel for cloud communication
4. Add cloud job monitoring

### Phase 4: Polish & Audit (Week 7-8)
1. Comprehensive security audit
2. Penetration testing
3. Documentation
4. Release preparation

---

## Security Incident Response

If a vulnerability is discovered:

1. **Immediate**: Disable affected component
2. **Assess**: Determine scope and impact
3. **Fix**: Develop and test patch
4. **Deploy**: Emergency release with signed update
5. **Disclose**: Responsible disclosure to users
6. **Review**: Post-mortem and process improvement

---

## Final Notes

This application handles valuable assets (GPU compute, user data, API credentials) that are attractive targets. Every feature must be designed with security as the primary concern, not an afterthought.

When in doubt:
- Choose the more secure option
- Add more validation
- Log more security events
- Restrict permissions further
- Require more authentication

It's better to have slightly more friction than to have a security breach.

**Remember:** Security is a process, not a feature. Every commit, every PR, every release must maintain these standards.
