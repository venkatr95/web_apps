from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import base64
from io import BytesIO
from docx import Document
import pdfkit
import openai
from sklearn.feature_extraction.text import TfidfVectorizer
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = "your_openai_key_here"

class ResumeRequest(BaseModel):
    job_description: str
    resume_text: str
    use_llm: Optional[bool] = False

def extract_keywords(text, top_n=20):
    vectorizer = TfidfVectorizer(stop_words='english', max_features=top_n)
    X = vectorizer.fit_transform([text])
    return vectorizer.get_feature_names_out()

def tailor_resume(resume_text: str, job_description: str) -> str:
    keywords = extract_keywords(job_description, top_n=25)
    existing = set(re.findall(r'\b\w+\b', resume_text.lower()))
    missing = [kw for kw in keywords if kw.lower() not in existing]
    if "skills" in resume_text.lower():
        resume_text = re.sub(
            r"(skills\s*:*)(.*?)(\n\n|\Z)",
            lambda m: f"{m.group(1)} {m.group(2).strip()}, {', '.join(missing)}\n\n",
            resume_text, flags=re.I|re.S)
    else:
        resume_text += "\n\nSkills: " + ", ".join(missing) + "\n"
    return resume_text.strip()

def generate_docx(resume_text: str) -> str:
    doc = Document()
    for line in resume_text.split('\n'):
        doc.add_paragraph(line)
    buffer = BytesIO()
    doc.save(buffer)
    return base64.b64encode(buffer.getvalue()).decode()

def generate_pdf(resume_text: str) -> str:
    html = f"<pre style='font-family: Arial;'>{resume_text}</pre>"
    pdf_bytes = pdfkit.from_string(html, False)
    return base64.b64encode(pdf_bytes).decode()

def improve_with_llm(resume_text: str, job_description: str) -> str:
    prompt = f"""You are a resume expert. Improve the following resume text to perfectly match the job description with ATS optimization.

Resume:
{resume_text}

Job Description:
{job_description}

Optimized Resume:
"""
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
    )
    return response['choices'][0]['message']['content'].strip()

@app.post("/optimize")
async def optimize_resume(data: ResumeRequest):
    tailored_resume = tailor_resume(data.resume_text, data.job_description)
    if data.use_llm:
        tailored_resume = improve_with_llm(tailored_resume, data.job_description)
    docx_base64 = generate_docx(tailored_resume)
    pdf_base64 = generate_pdf(tailored_resume)
    return {
        "optimized_resume": tailored_resume,
        "docx_base64": docx_base64,
        "pdf_base64": pdf_base64,
    }