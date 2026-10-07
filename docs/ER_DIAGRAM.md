# Database schema

```mermaid
erDiagram
    USER ||--o{ PROJECT : owns
    PROJECT ||--o{ TASK : contains
    USER {
        int id PK
        string fullName
        string email UK
        string passwordHash "bcrypt"
        int tokenVersion "bumped on logout"
        datetime createdAt
    }
    PROJECT {
        int id PK
        string name
        string description
        enum status "NOT_STARTED | IN_PROGRESS | COMPLETED"
        datetime startDate
        datetime endDate
        datetime createdAt
        int userId FK
    }
    TASK {
        int id PK
        string name
        string description
        enum priority "LOW | MEDIUM | HIGH"
        enum status "PENDING | IN_PROGRESS | COMPLETED"
        datetime dueDate
        datetime createdAt
        int projectId FK
    }
```

- `Project.userId -> User.id` (ON DELETE CASCADE)
- `Task.projectId -> Project.id` (ON DELETE CASCADE)
- A task has no `userId`: ownership is derived through its project, which keeps the schema normalized.
- Source of truth: `backend/prisma/schema.prisma`.
