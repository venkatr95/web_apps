from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, FormData
import uuid

# SQLite database file
DATABASE_URL = "sqlite:///./uuid_forms.db"

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database and create tables"""
    Base.metadata.create_all(bind=engine)
    seed_demo_data()


def seed_demo_data():
    """Seed database with demo UUID-object mappings for hospital system"""
    db = SessionLocal()
    
    # Check if data already exists
    existing_count = db.query(FormData).count()
    if existing_count > 0:
        db.close()
        return
    
    demo_data = [
        # ==================== DOCTORS ====================
        FormData(
            uuid=str(uuid.uuid4()),
            name="Dr. Sarah Mitchell",
            email="s.mitchell@cityhospital.com",
            phone="+1-555-2001",
            address="100 Medical Plaza, Chicago, IL 60601",
            company="City General Hospital",
            position="Cardiologist",
            notes="Board-certified cardiologist, 15 years experience, specializes in interventional cardiology"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Dr. James Chen",
            email="j.chen@stjohnsmed.org",
            phone="+1-555-2002",
            address="250 Health Center Dr, Los Angeles, CA 90012",
            company="St. John's Medical Center",
            position="Emergency Medicine Physician",
            notes="ER attending physician, trauma specialist, ATLS certified"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Dr. Emily Rodriguez",
            email="e.rodriguez@pediatriccare.com",
            phone="+1-555-2003",
            address="450 Children's Way, Houston, TX 77002",
            company="Children's Healthcare Network",
            position="Pediatrician",
            notes="Board-certified pediatrician, specializes in childhood development and immunizations"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Dr. Michael Thompson",
            email="m.thompson@orthocenter.com",
            phone="+1-555-2004",
            address="780 Sports Medicine Blvd, Phoenix, AZ 85001",
            company="Advanced Orthopedic Center",
            position="Orthopedic Surgeon",
            notes="Sports medicine and joint replacement specialist, fellowship trained"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Dr. Rachel Patel",
            email="r.patel@neuroinstitute.org",
            phone="+1-555-2005",
            address="300 Brain Health Center, Boston, MA 02101",
            company="Northeast Neurology Institute",
            position="Neurologist",
            notes="Specializes in stroke care and movement disorders, research focus on Parkinson's disease"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Dr. William Foster",
            email="w.foster@oncologycenter.com",
            phone="+1-555-2006",
            address="550 Cancer Treatment Center, Seattle, WA 98101",
            company="Pacific Oncology Institute",
            position="Oncologist",
            notes="Medical oncologist, specializes in breast and lung cancer, clinical trials coordinator"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Dr. Amanda Lee",
            email="a.lee@dermaclinic.org",
            phone="+1-555-2007",
            address="820 Skin Health Plaza, Miami, FL 33101",
            company="Dermatology Associates",
            position="Dermatologist",
            notes="Board-certified dermatologist, cosmetic and surgical dermatology"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Dr. Carlos Ramirez",
            email="c.ramirez@gastrocenter.com",
            phone="+1-555-2008",
            address="220 Digestive Health Dr, Denver, CO 80201",
            company="Mountain View GI Center",
            position="Gastroenterologist",
            notes="Endoscopy specialist, inflammatory bowel disease expert"
        ),
        
        # ==================== PATIENTS ====================
        FormData(
            uuid=str(uuid.uuid4()),
            name="John Smith",
            email="john.smith@email.com",
            phone="+1-555-8001",
            address="1234 Oak Street, Chicago, IL 60605",
            company="N/A",
            position="Patient",
            notes="Age 45, Type 2 Diabetes, Hypertension. Primary physician: Dr. Sarah Mitchell. Last visit: 01/15/2026"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Mary Johnson",
            email="mary.johnson@email.com",
            phone="+1-555-8002",
            address="567 Maple Ave, Los Angeles, CA 90015",
            company="N/A",
            position="Patient",
            notes="Age 62, Post-cardiac surgery, cardiac rehabilitation program. Cardiologist: Dr. Sarah Mitchell"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Robert Williams",
            email="r.williams@email.com",
            phone="+1-555-8003",
            address="890 Pine Road, Houston, TX 77010",
            company="N/A",
            position="Patient",
            notes="Age 38, Knee replacement surgery scheduled 02/10/2026. Surgeon: Dr. Michael Thompson"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Patricia Brown",
            email="patricia.b@email.com",
            phone="+1-555-8004",
            address="432 Elm Street, Phoenix, AZ 85003",
            company="N/A",
            position="Patient",
            notes="Age 71, Parkinson's disease, ongoing treatment. Neurologist: Dr. Rachel Patel"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Michael Davis",
            email="m.davis@email.com",
            phone="+1-555-8005",
            address="765 Cedar Lane, Boston, MA 02108",
            company="N/A",
            position="Patient",
            notes="Age 29, Motor vehicle accident, emergency treatment 01/20/2026. ER physician: Dr. James Chen"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Jennifer Martinez",
            email="jen.martinez@email.com",
            phone="+1-555-8006",
            address="234 Birch Ave, Seattle, WA 98104",
            company="N/A",
            position="Patient",
            notes="Age 54, Breast cancer treatment, chemotherapy cycle 3 of 6. Oncologist: Dr. William Foster"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="David Anderson",
            email="d.anderson@email.com",
            phone="+1-555-8007",
            address="678 Willow Dr, Miami, FL 33125",
            company="N/A",
            position="Patient",
            notes="Age 67, Skin cancer screening, follow-up appointment needed. Dermatologist: Dr. Amanda Lee"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Emily Taylor",
            email="emily.t@email.com",
            phone="+1-555-8008",
            address="901 Spruce St, Denver, CO 80202",
            company="N/A",
            position="Patient",
            notes="Age 41, Crohn's disease, managing symptoms with medication. GI specialist: Dr. Carlos Ramirez"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Sarah Thompson",
            email="sarah.thompson@email.com",
            phone="+1-555-8009",
            address="345 Redwood Ln, Houston, TX 77020",
            company="N/A",
            position="Patient",
            notes="Age 8, Routine pediatric checkup, immunizations up to date. Pediatrician: Dr. Emily Rodriguez"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="James Wilson",
            email="j.wilson@email.com",
            phone="+1-555-8010",
            address="123 Aspen Ct, Chicago, IL 60610",
            company="N/A",
            position="Patient",
            notes="Age 55, Pre-op evaluation for hernia repair. Surgery scheduled 02/15/2026"
        ),
        
        # ==================== NURSES ====================
        FormData(
            uuid=str(uuid.uuid4()),
            name="Maria Gonzalez",
            email="m.gonzalez@cityhospital.com",
            phone="+1-555-3001",
            address="100 Medical Plaza, Chicago, IL 60601",
            company="City General Hospital",
            position="Registered Nurse - ICU",
            notes="Critical care nurse with 8 years ICU experience, BSN, CCRN certified"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="David Kim",
            email="d.kim@stjohnsmed.org",
            phone="+1-555-3002",
            address="250 Health Center Dr, Los Angeles, CA 90012",
            company="St. John's Medical Center",
            position="Nurse Practitioner",
            notes="Family medicine NP, primary care experience, DNP degree"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Jennifer Walsh",
            email="j.walsh@pediatriccare.com",
            phone="+1-555-3003",
            address="450 Children's Way, Houston, TX 77002",
            company="Children's Healthcare Network",
            position="Pediatric Nurse",
            notes="PICU nurse, PALS and NRP certified, works with neonatal patients"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Ashley Robinson",
            email="a.robinson@cityhospital.com",
            phone="+1-555-3004",
            address="100 Medical Plaza, Chicago, IL 60601",
            company="City General Hospital",
            position="Registered Nurse - Surgery",
            notes="OR nurse, 12 years surgical experience, CNOR certified"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Christopher Lee",
            email="c.lee@emergencycare.org",
            phone="+1-555-3005",
            address="250 Health Center Dr, Los Angeles, CA 90012",
            company="St. John's Medical Center",
            position="Emergency Room Nurse",
            notes="ER nurse, trauma level 1 certified, TNCC and CEN credentials"
        ),
        
        # ==================== MEDICAL TECHNICIANS ====================
        FormData(
            uuid=str(uuid.uuid4()),
            name="Thomas Anderson",
            email="t.anderson@citylabs.com",
            phone="+1-555-4001",
            address="500 Laboratory Dr, Chicago, IL 60601",
            company="City Medical Laboratories",
            position="Medical Laboratory Technician",
            notes="Clinical lab tech, specializes in hematology and microbiology testing"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Lisa Chang",
            email="l.chang@imaging.org",
            phone="+1-555-4002",
            address="650 Radiology Center, San Diego, CA 92101",
            company="Advanced Imaging Center",
            position="Radiologic Technologist",
            notes="CT and MRI certified, 10 years experience in diagnostic imaging"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Brian Murphy",
            email="b.murphy@cardiotech.com",
            phone="+1-555-4003",
            address="100 Medical Plaza, Chicago, IL 60601",
            company="City General Hospital",
            position="Cardiovascular Technician",
            notes="Performs EKGs, stress tests, and cardiac monitoring"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Michelle Santos",
            email="m.santos@labservices.org",
            phone="+1-555-4004",
            address="450 Children's Way, Houston, TX 77002",
            company="Children's Healthcare Network",
            position="Phlebotomist",
            notes="Pediatric phlebotomy specialist, excellent with children"
        ),
        
        # ==================== HOSPITAL ADMINISTRATORS & SUPPORT STAFF ====================
        FormData(
            uuid=str(uuid.uuid4()),
            name="Robert Martinez",
            email="r.martinez@cityhospital.com",
            phone="+1-555-5001",
            address="100 Medical Plaza, Chicago, IL 60601",
            company="City General Hospital",
            position="Hospital Administrator",
            notes="MBA in Healthcare Management, oversees operations for 400-bed facility"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Susan Bradley",
            email="s.bradley@healthsystems.org",
            phone="+1-555-5002",
            address="900 Administrative Plaza, Philadelphia, PA 19101",
            company="Metro Health Systems",
            position="Director of Patient Services",
            notes="Manages patient care coordination and quality improvement initiatives"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Dr. Kevin O'Brien",
            email="k.obrien@hospitalpharm.com",
            phone="+1-555-6001",
            address="100 Medical Plaza, Chicago, IL 60601",
            company="City General Hospital",
            position="Clinical Pharmacist",
            notes="PharmD, specializes in oncology pharmacy, medication therapy management"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Angela Davis",
            email="a.davis@cityhospital.com",
            phone="+1-555-7001",
            address="100 Medical Plaza, Chicago, IL 60601",
            company="City General Hospital",
            position="Patient Care Coordinator",
            notes="Handles patient scheduling, insurance verification, and care transitions"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Mark Williams",
            email="m.williams@respcare.org",
            phone="+1-555-7002",
            address="250 Health Center Dr, Los Angeles, CA 90012",
            company="St. John's Medical Center",
            position="Respiratory Therapist",
            notes="RRT certified, works with ventilator patients and pulmonary rehabilitation"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Patricia Moore",
            email="p.moore@medicalrecords.com",
            phone="+1-555-7003",
            address="100 Medical Plaza, Chicago, IL 60601",
            company="City General Hospital",
            position="Medical Records Specialist",
            notes="RHIA certified, manages electronic health records and HIPAA compliance"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Daniel Garcia",
            email="d.garcia@facilities.org",
            phone="+1-555-7004",
            address="250 Health Center Dr, Los Angeles, CA 90012",
            company="St. John's Medical Center",
            position="Facilities Manager",
            notes="Oversees building maintenance, safety systems, and environmental services"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Linda Chen",
            email="l.chen@billing.com",
            phone="+1-555-7005",
            address="100 Medical Plaza, Chicago, IL 60601",
            company="City General Hospital",
            position="Medical Billing Specialist",
            notes="Handles insurance claims, patient billing, and payment processing"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Karen White",
            email="k.white@security.org",
            phone="+1-555-7006",
            address="250 Health Center Dr, Los Angeles, CA 90012",
            company="St. John's Medical Center",
            position="Security Supervisor",
            notes="Hospital security, emergency response coordinator, 15 years experience"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Steven Jackson",
            email="s.jackson@nutrition.com",
            phone="+1-555-7007",
            address="450 Children's Way, Houston, TX 77002",
            company="Children's Healthcare Network",
            position="Clinical Dietitian",
            notes="RD certified, pediatric nutrition specialist, creates meal plans for patients"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Rebecca Turner",
            email="r.turner@socialwork.org",
            phone="+1-555-7008",
            address="100 Medical Plaza, Chicago, IL 60601",
            company="City General Hospital",
            position="Medical Social Worker",
            notes="LCSW, assists patients with discharge planning and community resources"
        ),
        FormData(
            uuid=str(uuid.uuid4()),
            name="Paul Adams",
            email="p.adams@transport.com",
            phone="+1-555-7009",
            address="250 Health Center Dr, Los Angeles, CA 90012",
            company="St. John's Medical Center",
            position="Patient Transport Coordinator",
            notes="Manages patient transport within hospital and ambulance services"
        )
    ]
    
    db.add_all(demo_data)
    db.commit()
    db.close()
    
    print(f"✓ Seeded database with {len(demo_data)} demo hospital records")
    print(f"  - 8 Doctors")
    print(f"  - 10 Patients")
    print(f"  - 5 Nurses")
    print(f"  - 4 Medical Technicians")
    print(f"  - 12 Hospital Workers & Support Staff")
