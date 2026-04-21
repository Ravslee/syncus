# SyncUs Features & Application Flow

SyncUs is a real-time couple's compatibility quiz application built with React Native and Firebase. It allows couples to answer simultaneous questions and instantly compare their results to see how well they match.

## 🌟 Core Features

### 1. User Management & Authentication
*   **Email & Password Authentication**: Secure user login and registration.
*   **Onboarding Flow**: Dedicated profile setup ensuring users have a display name and necessary profile metadata before joining matches.
*   **Persistent Sessions**: Users stay logged in across application restarts.

### 2. Real-Time Multiplayer Rooms
*   **Room Creation & Joining**: Users can generate a unique 6-character room code or join an existing room via a partner's code.
*   **Lobby Hub**: A central hub serving as the entry point for starting new rooms, re-joining active sessions, or checking history.
*   **Synchronized Waiting Room**: Real-time Firebase presence keeps track of when both users have joined and are ready to play.

### 3. Dynamic Quiz Engine
*   **Categorized Quizzes**: Questions are grouped into distinct themes (e.g., "Relationship Basics", "Future Goals").
*   **Simultaneous Gameplay**: Both partners answer questions asynchronously without seeing the other's answers until the end.
*   **Real-time Partner Status**: See when your partner is still answering or has completed the quiz.

### 4. Detailed Results & Analytics
*   **Compatibility Scoring**: Calculates a percentage match based on perfectly aligned answers.
*   **Question Breakdown**: The Summary Screen provides a detailed, side-by-side comparison of each partner's selected answers for deep-dive discussions.
*   **History Logs**: Saved records of past quizzes so couples can look back at their previous scores.

### 5. Seamless Reconnection & Multi-Round Support
*   **Resume Capability**: Players who accidentally drop out can resume their active quiz seamlessly from the Lobby.
*   **Play Again Loop**: Allows couples to choose new categories without re-establishing a room connection, resetting state correctly for the next round.

---

## 🧭 Application Flow

The following diagram illustrates the navigational flow users take through the application:

```mermaid
graph TD
    classDef default fill:#1a1a1a,stroke:#333,stroke-width:2px,color:#fff;
    classDef auth fill:#2a1b38,stroke:#9b59b6,stroke-width:2px,color:#fff;
    classDef main fill:#1b2a38,stroke:#3498db,stroke-width:2px,color:#fff;
    classDef game fill:#1b3824,stroke:#2ecc71,stroke-width:2px,color:#fff;
    classDef results fill:#382b1b,stroke:#e67e22,stroke-width:2px,color:#fff;

    A[Login / Sign Up]:::auth --> B{Onboarded?}:::auth
    B -- No --> C[Onboarding Screen]:::auth
    C --> D[Lobby Hub]:::main
    B -- Yes --> D

    D --> E[Create Room]:::main
    D --> F[Join Room]:::main
    D --> G[(Resume Active Game)]:::main
    D -.-> P[History Screen]:::main

    E -.-> H[Home Screen <br> Select Category]:::main
    H --> I[Waiting Room <br> Sync Up]:::main
    
    F --> I
    G --> I
    
    I -- Both Users Ready --> J[Quiz Screen]:::game
    J -. Answering .-> J
    
    J -- Finished --> K{Both Finished?}:::game
    K -- No --> L[Waiting For Partner State]:::game
    K -- Yes --> M[Result Screen <br> Match Score]:::results
    
    M --> N[Summary Screen <br> Interactive Breakdown]:::results
    N -- Play Again --> O[Reset Room State]:::main
    O --> H
```
