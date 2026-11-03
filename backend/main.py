from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from google import genai
from groq import Groq
from sqlalchemy.orm import Session
import os, asyncio, requests
from dotenv import load_dotenv
from auth import User, ChatSession, ChatMessage, UserSettings, get_db, hash_password, verify_password, create_token, decode_token
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File
import os
from models import SavedItem
import asyncio
import requests
from fastapi import Depends
from fastapi import UploadFile, File, Depends
import os
import shutil
from fastapi.staticfiles import StaticFiles

# 👇 Imports keela add pannunga
class ChatRequest(BaseModel):
    model: str
    prompt: str

load_dotenv()
AI_RESPONSE_INSTRUCTIONS = """
You are an advanced AI assistant and professional coding assistant.

GENERAL RESPONSE RULES:
1. Give clear, structured and useful answers.
2. Use meaningful headings and subheadings.
3. Use bullet points and numbered steps where appropriate.
4. Use Markdown tables when comparing information.
5. Explain concepts with practical examples.
6. Avoid unnecessary repetition.
7. Keep simple questions concise.

CODING RULES:
1. Generate complete, working code when requested.
2. Use proper Markdown code blocks with language names.
3. Include all required imports and dependencies.
4. Explain code logic step by step.
5. Include file names and folder structures when relevant.
6. Provide installation and execution commands.
7. Include expected output where useful.
8. Consider errors, edge cases and security.
9. Never claim code was tested unless it actually was.

For complex programming tasks, organize answers as:
- Understanding the requirement
- Project structure
- Dependencies
- Complete code
- How to run
- Expected output
- Explanation
"""
genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
security = HTTPBearer()

app = FastAPI()

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://ai-nexus-lime.vercel.app",
        "https://ai-nexus-git-main-hakkim.vercel.app",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    prompt: str
    model: str


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class MessageIn(BaseModel):
    role: str
    model: str | None = None
    content: str


class SessionCreate(BaseModel):
    title: str | None = "New Chat"


class ProfileUpdate(BaseModel):
    name: str
    phone: str
    country: str
    occupation: str
    website: str
    bio: str


class SettingsUpdate(BaseModel):
    default_model: str | None = None
    response_length: str | None = None
    auto_save: bool | None = None
    email_notifications: bool | None = None
    desktop_alerts: bool | None = None
    comparison_complete_alerts: bool | None = None

def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    payload = decode_token(creds.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.post("/api/me/upload-photo")
async def upload_photo(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    filename = f"user_{user.id}_{file.filename}"
    file_path = os.path.join("uploads", filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Save path in database
    user.profile_photo = f"/uploads/{filename}"
    db.commit()
    db.refresh(user)

    return {
        "message": "Photo uploaded successfully",
        "url": user.profile_photo
    }


@app.post("/api/signup")
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(name=req.name, email=req.email, hashed_password=hash_password(req.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_token(user.id, user.email)
    return {"token": token, "name": user.name, "email": user.email}


@app.post("/api/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_token(user.id, user.email)
    return {"token": token, "name": user.name, "email": user.email}


@app.get("/api/me")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):

    total_chats = db.query(ChatSession).filter(
        ChatSession.user_id == user.id
    ).count()

    return {
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "country": user.country,
        "occupation": user.occupation,
        "website": user.website,
        "bio": user.bio,
        "profile_photo": user.profile_photo,
        "total_chats": total_chats,
        "join_date": user.created_at.strftime("%d %b %Y")
    }
@app.put("/api/me")
def update_me(
    req: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.name = req.name
    user.phone = req.phone
    user.country = req.country
    user.occupation = req.occupation
    user.website = req.website
    user.bio = req.bio

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully"
    }   
    
@app.get("/api/saved")
def get_saved(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(SavedItem)
        .filter(SavedItem.user_id == user.id)
        .order_by(SavedItem.created_at.desc())
        .all()
    )

    recent = []

    for item in items:
        recent.append({
            "id": item.id,
            "title": item.title,
            "category": item.category,
            "favorite": item.favorite,
        })

    return {
        "pinned": [],
        "collections": [],
        "recent": recent,
        "activity": [],
    }

@app.post("/api/sessions")
def create_session(req: SessionCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = ChatSession(user_id=user.id, title=req.title or "New Chat")
    db.add(session)
    db.commit()
    db.refresh(session)
    return {"id": session.id, "title": session.title, "created_at": session.created_at}


@app.get("/api/sessions")
def list_sessions(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    sessions = (
        db.query(ChatSession)
        .filter(ChatSession.user_id == user.id)
        .order_by(ChatSession.created_at.desc())
        .all()
    )
    return [{"id": s.id, "title": s.title, "created_at": s.created_at} for s in sessions]


@app.get("/api/sessions/{session_id}")
def get_session(session_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at).all()
    return {
        "id": session.id,
        "title": session.title,
        "messages": [{"role": m.role, "model": m.model, "content": m.content} for m in messages],
    }


@app.post("/api/sessions/{session_id}/messages")
def add_message(session_id: int, req: MessageIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    msg = ChatMessage(session_id=session_id, role=req.role, model=req.model, content=req.content)
    db.add(msg)
    # auto-title the session from the first user message
    if session.title == "New Chat" and req.role == "user":
        session.title = req.content[:40] + ("..." if len(req.content) > 40 else "")
    db.commit()
    return {"status": "saved"}





@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session)
    db.commit()
    return {"status": "deleted"}
def _settings_dict(s: UserSettings):
    return {
        "default_model": s.default_model,
        "response_length": s.response_length,
        "auto_save": s.auto_save,
        "email_notifications": s.email_notifications,
        "desktop_alerts": s.desktop_alerts,
        "comparison_complete_alerts": s.comparison_complete_alerts,
    }


@app.get("/api/settings")
def get_settings(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
    if not settings:
        settings = UserSettings(user_id=user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return _settings_dict(settings)


@app.put("/api/settings")
def update_settings(req: SettingsUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
    if not settings:
        settings = UserSettings(user_id=user.id)
        db.add(settings)
    for field, value in req.dict(exclude_unset=True).items():
        setattr(settings, field, value)
    db.commit()
    db.refresh(settings)
    return _settings_dict(settings)


def call_gemini(prompt: str) -> str:
    response = genai_client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"{AI_RESPONSE_INSTRUCTIONS}\n\nUSER REQUEST:\n{prompt}"
    )
    return response.text


def call_groq(prompt: str, model_id: str, hide_reasoning: bool = False) -> str:
    params = {
        "model": model_id,
        "messages": [
            {
                "role": "system",
                "content": AI_RESPONSE_INSTRUCTIONS
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    }

    if hide_reasoning:
        params["reasoning_format"] = "hidden"

    res = groq_client.chat.completions.create(**params)

    return res.choices[0].message.content

def call_openrouter(prompt: str) -> str:
    api_key = os.getenv("OPENROUTER_API_KEY")

    if not api_key:
        raise Exception("OpenRouter API key is missing")

    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://ai-nexus-lime.vercel.app",
        "X-Title": "AI Nexus"
    }

    payload = {
    "model": "openrouter/free",
    "messages": [
        {
            "role": "system",
            "content": AI_RESPONSE_INSTRUCTIONS
        },
        {
            "role": "user",
            "content": prompt
        }
    ]
}

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=90
    )

    response.raise_for_status()

    data = response.json()

    if not data.get("choices"):
        raise Exception("OpenRouter returned an empty response")

    return data["choices"][0]["message"]["content"]

def call_ollama(prompt: str, model_id: str = "llama3.2") -> str:
    print("🔥 OLLAMA FUNCTION CALLED")

    url = "http://127.0.0.1:11434/api/generate"

    try:
        res = requests.post(
            url,
            json={
                "model": model_id,
                "prompt": prompt,
                "stream": False
            },
            timeout=120,
        )

        print("OLLAMA STATUS:", res.status_code)
        print("OLLAMA RESPONSE:", res.text)

        res.raise_for_status()

        data = res.json()

        return data["response"]

    except requests.exceptions.ConnectionError as e:
        print("❌ OLLAMA CONNECTION ERROR:", e)
        raise Exception("Ollama connection failed")

    except requests.exceptions.Timeout as e:
        print("❌ OLLAMA TIMEOUT ERROR:", e)
        raise Exception("Ollama response timeout")

    except Exception as e:
        print("❌ OLLAMA ERROR:", repr(e))
        raise e



# AI MODEL FUNCTIONS
# AI MODEL FUNCTIONS
MODEL_FUNCS = {
    "gemini": lambda p: call_gemini(p),

    "llama70b": lambda p: call_groq(
        p, "openai/gpt-oss-120b"
    ),

    "llama8b": lambda p: call_groq(
        p, "openai/gpt-oss-20b"
    ),

    "qwen": lambda p: call_groq(
        p, "qwen/qwen3.8-27b"
    ),

    # OpenRouter Free
    "offline": lambda p: call_openrouter(p),
}
@app.post("/api/chat")
async def chat(
    req: ChatRequest,
    user: User = Depends(get_current_user)
):
    func = MODEL_FUNCS.get(req.model)

    if not func:
        raise HTTPException(
            status_code=400,
            detail="Invalid model"
        )

    try:
        reply = await asyncio.to_thread(
            func,
            req.prompt
        )

        return {"reply": reply}

    except Exception as e:
        print("CHAT ERROR:", repr(e))

        raise HTTPException(
            status_code=502,
            detail=f"AI provider error: {str(e)}"
        )



    