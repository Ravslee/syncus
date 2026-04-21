# SyncUs Entity-Relationship (ER) Diagram

Based on the core types in your application (`src/types/index.ts`), here is the Entity-Relationship Diagram detailing how the main data structures connect.

```mermaid
erDiagram
    USER {
        string uid PK
        string email
        string displayName
        number createdAt
        number lastLoginAt
        string photoURL
    }

    ROOM {
        string id PK
        string code "6-character unique code"
        string[] users "Array of User UIDs"
        string categoryId FK
        string status "WAITING, ACTIVE, COMPLETED"
        number createdAt
    }

    ROOM_STATE {
        string roomId FK
        string userId FK
        string status "JOINED, ANSWERING, COMPLETED"
        number currentQuestionIndex
        number completedAt
    }

    CATEGORY {
        string id PK
        string name
        string icon
        string description
        string color
        string[] gradient
    }

    QUESTION {
        string id PK
        string categoryId FK
        string text
        string[] options
        number order
    }

    ANSWER {
        string roomId FK
        string userId FK
        string questionId FK
        number selectedOption
        number createdAt
    }

    RESULT {
        string roomId FK
        string categoryId FK
        string[] users "Array of User UIDs"
        number score
        number totalQuestions
        number calculatedAt
        number createdAt
    }

    QUESTION_BREAKDOWN {
        string questionId FK
        string questionText
        number user1Answer
        number user2Answer
        boolean match
    }

    %% Relationships
    USER ||--o{ ROOM_STATE : "has"
    USER ||--o{ ANSWER : "submits"
    
    ROOM ||--o{ ROOM_STATE : "contains"
    ROOM ||--|{ ANSWER : "collects"
    ROOM ||--o| RESULT : "generates"
    
    CATEGORY ||--o{ ROOM : "is played in"
    CATEGORY ||--|{ QUESTION : "contains"
    
    QUESTION ||--o{ ANSWER : "receives"
    
    RESULT ||--|{ QUESTION_BREAKDOWN : "includes breakdown of"
```

## Entity Details

- **USER**: The core profile for each person using the app. Logged in and authenticated via email.
- **CATEGORY**: Pre-defined themes (e.g., "Relationships", "Future Goals") that contain a set of questions.
- **QUESTION**: Individual questions belonging to a specific category.
- **ROOM**: Represents a game session between two users. It holds the chosen category and tracks the high-level progression state.
- **ROOM_STATE**: Represents an individual user's state *within* a specific room (whether they are joined, currently answering questions, or finished).
- **ANSWER**: Captures a single user's response to a specific question inside a given room.
- **RESULT**: The final aggregated data for a completed room. It calculates the final score and has an embedded array of **QUESTION_BREAKDOWN** objects representing the side-by-side comparison of user answers. 
