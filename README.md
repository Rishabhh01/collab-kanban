 ## Collaborative Kanban (Real-Time Boards)

A real-time collaborative Kanban platform designed for seamless project and task management. This application allows teams to create boards, manage tasks, and collaborate live, similar to tools like Trello or Jira — but with custom-built real-time features and presence tracking.

Built as part of an assignment, the project emphasizes real-time updates, concurrent editing, and scalability, showcasing advanced full-stack development skills.

---

##  Key Features
- **Seamless Real-Time Collaboration:**  
  Work in sync with your team using WebSocket technology. See changes instantly without refreshing the page.

- **Secure & Modern Authentication:**  
  JWT-based authentication ensures your data is protected, with a secure and simple login/signup flow.

- **Intuitive Drag & Drop:**  
  Effortlessly organize your workflow by dragging and dropping cards and columns.

- **Emotionally Resonant UI:**  
  A clean, branded interface designed to be welcoming and reduce cognitive load.

- **Optimistic UI Updates:**  
  Experience a snappy and responsive interface that feels fast, even on slower networks.

- **Robust & Scalable Backend:**  
  Built on Express v5, ensuring reliable and efficient performance.

- **Containerized for Easy Deployment:**  
  Full-stack Docker setup allows for consistent environments and one-command deployments.

---

##  Tech Stack & Architecture
This project uses a **modern, decoupled architecture** with a React frontend, a Node.js/Express backend, and a PostgreSQL database managed by Supabase.

| **Layer**     | **Technologies & Frameworks** |
|---------------|--------------------------------|
| **Frontend**  | React, Vite, Tailwind CSS |
| **Backend**   | Node.js, Express v5, WebSocket Server (`ws`) |
| **Database**  | Supabase (PostgreSQL) |
| **Auth**      | Supabase Auth, JSON Web Tokens (JWT) |
| **Deployment**| Docker, Render.com |

---

##  Getting Started
Follow these instructions to set up and run the project locally.

### **Prerequisites**
- Node.js (v18.x or higher)
- npm (v9.x or higher)
- Git
- Docker (Optional, for containerized deployment)

---

### **1. Clone the Repository**
```bash
git clone https://github.com/Rishabhh01/collab-kanban.git
cd collab-kanban
```

---

### **2. Configure Environment Variables**

#### **Frontend `.env`**
```bash
VITE_API_URL=https://your-backend-url.onrender.com/api
```
#### **Backend `.env`**
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

---

### **3. Install dependencies**

Open a terminal and run the following inside each folder:

#### **Frontend**
```bash
npm install
```

#### **Backend**
```bash
npm install
```

---

### **4. Run the app locally**

#### **Frontend**
```bash
cd frontend
npm install
npm run dev
```
#### **Backend**
```bash
cd backend
npm install
npm start # Or: node server.js
```
---

##  Docker Deployment

The application is fully containerized. To build and run the entire stack with a single command:

**Build the Docker image:**
```bash
docker build -t collabkanban .
```
**Run the container:**
```bash
docker build -t collabkanban .
docker run -p 5000:5000 collabkanban
```

This command serves both the frontend and backend from a single container on port 5000.
---

##  Authentication Flow

- Users sign up and log in using **email and password**  
- **JWT tokens** are stored in `localStorage` and sent via `Authorization` headers  
- **CORS** is configured to allow secure cross-origin requests from the frontend  

---

## Screenshots


---
<img width="1221" height="818" alt="github image" src="https://github.com/user-attachments/assets/6fe79cc0-a579-4ae8-9998-1a1c41373854" />

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to improve.

> Make sure to follow the existing code style and include relevant tests or validation.

---

##  Feedback

Have ideas, bugs, or suggestions?  
Open an issue or start a discussion.  
CollabKanban thrives on **collaborative critique and emotional clarity**.

---



## Built by Rishabh

A product-minded engineer who blends technical rigor with emotional design. CollabKanban is a reflection of that philosophy: fast, friendly, and built to feel like home.
