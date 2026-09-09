"""
Script to add duplicate and stale records to the database for testing purposes.
This helps test the agent's ability to detect and handle data quality issues.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import FormData
from datetime import datetime, timedelta
import uuid

# Database connection
DATABASE_URL = "sqlite:///./uuid_forms.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def add_duplicate_records():
    """Add duplicate records - same people with different UUIDs"""
    db = SessionLocal()
    
    # Duplicate 1: Dr. Sarah Mitchell (original doctor) - slight variations
    duplicate1_uuid = str(uuid.uuid4())
    duplicate1 = FormData(
        uuid=duplicate1_uuid,
        name="Sarah Mitchell",  # Without Dr. prefix
        email="s.mitchell@cityhospital.com",  # Same email
        phone="+1-555-2001",  # Same phone
        address="100 Medical Plaza, Chicago, IL 60601",
        company="City General Hospital",
        position="Cardiologist",
        notes="Cardiologist with 15 years of experience. DUPLICATE RECORD - Created 4 months ago, rarely accessed.",
        is_duplicate=True,
        created_at=datetime.utcnow() - timedelta(days=120),
        updated_at=datetime.utcnow() - timedelta(days=120)
    )
    
    # Duplicate 2: John Smith (original patient) - typo in name
    duplicate2_uuid = str(uuid.uuid4())
    duplicate2 = FormData(
        uuid=duplicate2_uuid,
        name="Jon Smith",  # Typo: Jon instead of John
        email="john.smith@email.com",  # Same email
        phone="+1-555-8001",  # Same phone
        address="1234 Oak Street, Chicago, IL 60605",
        company="N/A",
        position="Patient",
        notes="Age 45, Diabetic patient. DUPLICATE RECORD - Name typo (Jon vs John).",
        is_duplicate=True,
        created_at=datetime.utcnow() - timedelta(days=90),
        updated_at=datetime.utcnow() - timedelta(days=90)
    )
    
    # Duplicate 3: Maria Gonzalez (nurse) - different email format
    duplicate3_uuid = str(uuid.uuid4())
    duplicate3 = FormData(
        uuid=duplicate3_uuid,
        name="Maria Gonzalez",
        email="maria.gonzalez@cityhospital.com",  # Different email format
        phone="+1-555-3001",  # Same phone
        address="100 Medical Plaza, Chicago, IL 60601",
        company="City General Hospital",
        position="RN - ICU",  # Abbreviated position
        notes="ICU nurse, CCRN certified. DUPLICATE RECORD - Different email format.",
        is_duplicate=True,
        created_at=datetime.utcnow() - timedelta(days=60),
        updated_at=datetime.utcnow() - timedelta(days=60)
    )
    
    # Duplicate 4: Dr. James Chen - completely identical
    duplicate4_uuid = str(uuid.uuid4())
    duplicate4 = FormData(
        uuid=duplicate4_uuid,
        name="Dr. James Chen",
        email="j.chen@stjohnsmed.org",
        phone="+1-555-2002",
        address="250 Health Center Dr, Los Angeles, CA 90012",
        company="St. John's Medical Center",
        position="Emergency Medicine Physician",
        notes="ER attending physician, trauma specialist. DUPLICATE RECORD - Completely identical to original.",
        is_duplicate=True,
        created_at=datetime.utcnow() - timedelta(days=180),
        updated_at=datetime.utcnow() - timedelta(days=180)
    )
    
    # Duplicate 5: Mary Johnson - with address typo
    duplicate5_uuid = str(uuid.uuid4())
    duplicate5 = FormData(
        uuid=duplicate5_uuid,
        name="Mary Johnson",
        email="mary.johnson@email.com",
        phone="+1-555-8002",
        address="567 Maple Avenue, Los Angeles, CA 90015",  # Avenue instead of Ave
        company="N/A",
        position="Patient",
        notes="Post-cardiac surgery patient. DUPLICATE RECORD - Address format differs.",
        is_duplicate=True,
        created_at=datetime.utcnow() - timedelta(days=45),
        updated_at=datetime.utcnow() - timedelta(days=45)
    )
    
    duplicates = [duplicate1, duplicate2, duplicate3, duplicate4, duplicate5]
    db.add_all(duplicates)
    db.commit()
    
    print(f"✓ Added {len(duplicates)} duplicate records:")
    for dup in duplicates:
        print(f"  - {dup.name} (UUID: {dup.uuid})")
    
    db.close()
    return duplicates


def add_stale_records():
    """Add stale records - records that haven't been accessed in a long time"""
    db = SessionLocal()
    
    # Stale 1: Old doctor who transferred
    stale1 = FormData(
        uuid=str(uuid.uuid4()),
        name="Dr. Richard Miller",
        email="r.miller@oldhospital.com",
        phone="+1-555-9001",
        address="999 Old Medical Dr, Chicago, IL 60601",
        company="Old City Hospital (Closed)",
        position="General Practitioner",
        notes="STALE RECORD - Transferred to different hospital system in 2023. Not accessed in 2+ years.",
        created_at=datetime.utcnow() - timedelta(days=800),
        updated_at=datetime.utcnow() - timedelta(days=730)
    )
    
    # Stale 2: Former patient who moved away
    stale2 = FormData(
        uuid=str(uuid.uuid4()),
        name="Timothy Brooks",
        email="tim.brooks@oldmail.com",
        phone="+1-555-9002",
        address="888 Former Residence St, Chicago, IL 60601",
        company="N/A",
        position="Patient",
        notes="STALE RECORD - Former patient, moved out of state in 2023. Do not contact. Last updated 2.5 years ago.",
        created_at=datetime.utcnow() - timedelta(days=950),
        updated_at=datetime.utcnow() - timedelta(days=900)
    )
    
    # Stale 3: Retired nurse
    stale3 = FormData(
        uuid=str(uuid.uuid4()),
        name="Dorothy Harrison",
        email="d.harrison@retired.com",
        phone="+1-555-9003",
        address="555 Retirement Lane, Phoenix, AZ 85001",
        company="City General Hospital (Former)",
        position="Registered Nurse - Retired",
        notes="STALE RECORD - Retired in December 2023 after 40 years of service. Record not updated in 15+ months.",
        created_at=datetime.utcnow() - timedelta(days=1200),
        updated_at=datetime.utcnow() - timedelta(days=450)
    )
    
    # Stale 4: Deceased patient (sensitive data)
    stale4 = FormData(
        uuid=str(uuid.uuid4()),
        name="George Patterson",
        email="g.patterson@email.com",
        phone="+1-555-9004",
        address="777 Memorial Ave, Boston, MA 02101",
        company="N/A",
        position="Patient",
        notes="STALE RECORD - Deceased 2024-03-15. Record kept for legal/insurance purposes. Archive after 2027. Not accessed in 21+ months.",
        created_at=datetime.utcnow() - timedelta(days=1100),
        updated_at=datetime.utcnow() - timedelta(days=650)
    )
    
    # Stale 5: Temporary contractor
    stale5 = FormData(
        uuid=str(uuid.uuid4()),
        name="Jennifer Taylor (Contractor)",
        email="j.taylor@tempstaff.com",
        phone="+1-555-9005",
        address="123 Contract Workers Blvd, Seattle, WA 98101",
        company="MedTemp Staffing Agency",
        position="Temporary Administrative Assistant",
        notes="STALE RECORD - Contract ended 2023-08-30. 6-month assignment completed. Not updated in 17+ months.",
        created_at=datetime.utcnow() - timedelta(days=850),
        updated_at=datetime.utcnow() - timedelta(days=520)
    )
    
    # Stale 6: Equipment vendor (wrong category)
    stale6 = FormData(
        uuid=str(uuid.uuid4()),
        name="MedEquip Solutions Inc",
        email="sales@medequip.com",
        phone="+1-800-555-0100",
        address="4500 Industrial Park, Dallas, TX 75201",
        company="MedEquip Solutions",
        position="Vendor Representative",
        notes="STALE RECORD - Medical equipment vendor. Should be in vendor database, not patient/staff database. Not updated in 18+ months.",
        created_at=datetime.utcnow() - timedelta(days=680),
        updated_at=datetime.utcnow() - timedelta(days=550)
    )
    
    # Stale 7: Test record that was never cleaned up
    stale7 = FormData(
        uuid=str(uuid.uuid4()),
        name="Test User - DELETE",
        email="test@test.com",
        phone="+1-555-0000",
        address="123 Test Street, Test City, TS 00000",
        company="Test Company",
        position="Test Position",
        notes="STALE RECORD - THIS IS A TEST RECORD - SHOULD BE DELETED. Created during system testing phase. Not accessed in 4+ years.",
        created_at=datetime.utcnow() - timedelta(days=1500),
        updated_at=datetime.utcnow() - timedelta(days=1500)
    )
    
    stale_records = [stale1, stale2, stale3, stale4, stale5, stale6, stale7]
    db.add_all(stale_records)
    db.commit()
    
    print(f"\n✓ Added {len(stale_records)} stale records:")
    for stale in stale_records:
        days_since_update = (datetime.utcnow() - stale.updated_at).days
        print(f"  - {stale.name} (Last updated {days_since_update} days ago)")
    
    db.close()
    return stale_records


def main():
    print("=" * 60)
    print("Adding Test Records to Database")
    print("=" * 60)
    print()
    
    duplicates = add_duplicate_records()
    stale_records = add_stale_records()
    
    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Total duplicate records added: {len(duplicates)}")
    print(f"Total stale records added: {len(stale_records)}")
    print(f"Total test records added: {len(duplicates) + len(stale_records)}")
    print()
    print("These records can be used to test:")
    print("  - Duplicate detection algorithms")
    print("  - Data cleanup and archival processes")
    print("  - Agent's ability to identify data quality issues")
    print("  - Record merge and deduplication workflows")


if __name__ == "__main__":
    main()
