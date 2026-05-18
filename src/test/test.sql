-- 1. Pembuatan Tipe Enumerasi (Enums)
CREATE TYPE "CredentialType" AS ENUM (
  'YOUTUBE', 'GOOGLE'
);

CREATE TYPE "NodeType" AS ENUM (
  'INTITAL', 'MANUAL_TRIGGER', 'HTTP_REQUEST',  
  'GEMINI',  
  'YOUTUBE_LIVE_CHAT', 'YOUTUBE_DELETE_CHAT', 
  'YOUTUBE_VIDEO_COMMENT', 'GOOGLE_SHEETS', 'DECISION'
);

CREATE TYPE "ExecutionStatus" AS ENUM (
  'RUNNING', 'SUCCESS', 'FAILED'
);

-- 2. Tabel User
CREATE TABLE "user" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- 3. Tabel Session
CREATE TABLE "session" (
  "id" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "token" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "userId" TEXT NOT NULL,

  CONSTRAINT "session_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- 4. Tabel Account
CREATE TABLE "account" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "idToken" TEXT,
  "accessTokenExpiresAt" TIMESTAMP(3),
  "refreshTokenExpiresAt" TIMESTAMP(3),
  "scope" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "account_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 5. Tabel Verification
CREATE TABLE "verification" (
  "id" TEXT NOT NULL,
  "identifier" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- 6. Tabel Workflow
CREATE TABLE "workflow" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT NOT NULL,

  CONSTRAINT "workflow_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Tabel Credential
CREATE TABLE "Credential" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "value" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "type" "CredentialType" NOT NULL,
  "userId" TEXT NOT NULL,

  CONSTRAINT "Credential_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. Tabel Node
CREATE TABLE "node" (
  "id" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" "NodeType" NOT NULL,
  "position" JSONB NOT NULL,
  "data" JSONB NOT NULL DEFAULT '{}',
  "credentialId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "node_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "node_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "node_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 9. Tabel Connection
CREATE TABLE "connection" (
  "id" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "fromNodeId" TEXT NOT NULL,
  "toNodeId" TEXT NOT NULL,
  "fromOutput" TEXT NOT NULL DEFAULT 'main',
  "toInput" TEXT NOT NULL DEFAULT 'main',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "connection_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "connection_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "connection_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "node"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "connection_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "node"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "connection_nodes_outputs_key" ON "connection"("fromNodeId", "toNodeId", "fromOutput", "toInput");

-- 10. Tabel Execution
CREATE TABLE "Execution" (
  "id" TEXT NOT NULL,
  "workflowId" TEXT NOT NULL,
  "status" "ExecutionStatus" NOT NULL DEFAULT 'RUNNING',
  "error" TEXT,
  "errorStack" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "inngestEventId" TEXT NOT NULL,
  "output" JSONB,

  CONSTRAINT "Execution_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Execution_inngestEventId_key" ON "Execution"("inngestEventId");