# Scaffold — Firestore Database Schema

## Collections

### 1. `users` Collection
Document ID: `{userId}` (Firebase Auth UID)

```json
{
  "uid": "string",
  "email": "string",
  "displayName": "string",
  "fullName": "string",
  "bio": "string",
  "skills": "string (comma separated)",
  "education": "string",
  "primaryGoal": "string",
  "themePreference": "dark | light | cyber",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

### 2. `projects` Sub-collection
Path: `/users/{userId}/projects/{projectId}`

```json
{
  "id": "string",
  "name": "string",
  "tech": "string",
  "status": "Active | Completed | In Review",
  "progress": "number (0-100)",
  "createdAt": "timestamp"
}
```
