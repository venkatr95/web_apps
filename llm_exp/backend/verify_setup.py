"""
Setup Verification Script
Checks if all dependencies and configurations are correct
"""

import sys
import os
from pathlib import Path

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major == 3 and version.minor >= 8:
        print(f"✓ Python version: {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"✗ Python version: {version.major}.{version.minor}.{version.micro}")
        print("  Required: Python 3.8+")
        return False

def check_dependencies():
    """Check if required packages are installed"""
    required = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'openai',
        'pydantic',
    ]
    
    missing = []
    for package in required:
        try:
            __import__(package)
            print(f"✓ {package} installed")
        except ImportError:
            print(f"✗ {package} NOT installed")
            missing.append(package)
    
    return len(missing) == 0

def check_env_file():
    """Check if .env file exists and has OpenAI key"""
    env_path = Path('.env')
    
    if not env_path.exists():
        print("✗ .env file not found")
        print("  Run: copy .env.example .env")
        print("  Then add your OpenAI API key")
        return False
    
    print("✓ .env file exists")
    
    with open(env_path) as f:
        content = f.read()
        if 'OPENAI_API_KEY=' in content and 'your_openai_api_key_here' not in content:
            print("✓ OpenAI API key configured")
            return True
        else:
            print("✗ OpenAI API key not configured")
            print("  Edit .env and add your API key")
            return False

def check_file_structure():
    """Check if all required files exist"""
    required_files = [
        'main.py',
        'models.py',
        'database.py',
        'agent.py',
        'requirements.txt',
    ]
    
    all_exist = True
    for file in required_files:
        if Path(file).exists():
            print(f"✓ {file} exists")
        else:
            print(f"✗ {file} NOT found")
            all_exist = False
    
    return all_exist

def main():
    print("=" * 50)
    print("Backend Setup Verification")
    print("=" * 50)
    print()
    
    checks = [
        ("Python Version", check_python_version),
        ("File Structure", check_file_structure),
        ("Dependencies", check_dependencies),
        ("Environment Config", check_env_file),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n{name}:")
        print("-" * 30)
        result = check_func()
        results.append(result)
    
    print("\n" + "=" * 50)
    if all(results):
        print("✓ All checks passed! Backend is ready to run.")
        print("\nRun: python main.py")
    else:
        print("✗ Some checks failed. Please fix the issues above.")
        print("\nSetup steps:")
        print("1. Ensure Python 3.8+ is installed")
        print("2. Run: pip install -r requirements.txt")
        print("3. Run: copy .env.example .env")
        print("4. Edit .env and add your OpenAI API key")
    print("=" * 50)

if __name__ == "__main__":
    main()
