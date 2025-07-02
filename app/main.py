from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, spaces, content, chat
from app.core.database import create_db_and_tables


app = FastAPI(title="Spaces Backend API", version="1.0.0")

# CORS configuration
app.add_middleware( CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development; adjust in production 
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)


@app.on_event("startup")
async def on_startup():
    """Create database tables on startup."""
    await create_db_and_tables()


@app.get("/")
async def root():
    return {"message": "Welcome to the Spaces Backend API"}



# Include routers

app.include_router(auth.router)
app.include_router(spaces.router)
app.include_router(content.router)
app.include_router(chat.router)