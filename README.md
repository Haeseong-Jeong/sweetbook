## Sweetbook Dev Environment

### Stack
- Backend: Python FastAPI (uvicorn, `/health` endpoint)
- Frontend: React (Vite)
- Orchestration: Docker Compose + VSCode Dev Container

### Prerequisites
- Docker & Docker Compose
- VSCode with Dev Containers extension (선택이지만 권장)

### How to Run (Docker Compose)
```bash
# 1. 환경변수 파일 설정
cp backend/.env.example backend/.env
# backend/.env 파일을 열어 BOOKPRINT_API_KEY 입력

# 2. 실행
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:8000/health`

### Dev Container (VSCode)
1. VSCode에서 이 폴더를 엽니다.
2. `Dev Containers: Reopen in Container` 명령을 실행합니다.
3. 컨테이너 안에서 터미널을 열면 동일하게 `docker compose up --build`로 실행할 수 있습니다.

### Environment Variables
- 실제 Book Print API 키는 `.env` 파일로 관리하고, GitHub에는 커밋하지 않습니다.
- 예시 파일: `backend/.env.example`

사용 예시:
```bash
cp backend/.env.example backend/.env
# backend/.env 파일을 열어 BOOKPRINT_API_KEY를 Sandbox 키로 교체
```

백엔드 코드에서는 일반적인 방식으로 환경변수를 읽어 사용하면 됩니다.

