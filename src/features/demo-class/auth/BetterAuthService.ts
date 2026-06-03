import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Utility to simulate network/database latency
const simulateDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export class BetterAuthService {
  private id: string;
  private name: string;
  private email: string;

  constructor(id: string = "", name: string = "", email: string = "") {
    this.id = id;
    this.name = name;
    this.email = email;
  }

  public async signInWithEmail(email: string, password: string): Promise<any> {
    console.log(`[BetterAuthService] Executing SELECT query for: ${email}`);
    
    try {
      // Real Prisma ORM Query
      const user = await (prisma.user as any).findUnique({
        where: { email: email }
      });

      if (!user) {
        throw new Error("Invalid credentials or user not found.");
      }

      // Hash comparison simulation
      const isValidPassword = user.passwordHash === Buffer.from(password).toString('base64');
      if (!isValidPassword) {
        throw new Error("Invalid password provided.");
      }

      // Real Prisma ORM Query to create session
      const session = await (prisma.session as any).create({
        data: {
          userId: user.id,
          sessionToken: `sess_${Math.random().toString(36).substring(2, 15)}`,
          expiresAt: new Date(Date.now() + 86400000) // 1 day
        }
      });

      console.log(`[BetterAuthService] signIn successful for: ${email}`);
      return { 
        status: "success", 
        user: { id: user.id, email: user.email, name: user.name },
        sessionToken: session.sessionToken
      };
    } catch (error: any) {
      console.error(`[BetterAuthService] Error during signIn: ${error.message}`);
      return { status: "error", message: error.message };
    }
  }

  public async signUpWithEmail(email: string, password: string, passwordConfirm: string): Promise<any> {
    console.log(`[BetterAuthService] Executing INSERT query for: ${email}`);

    try {
      if (password !== passwordConfirm) {
        throw new Error("Passwords do not match.");
      }

      // Check existing user
      const existingUser = await (prisma.user as any).findUnique({
        where: { email: email }
      });

      if (existingUser) {
        throw new Error("User with this email already exists.");
      }

      // Real Prisma ORM Query for Insertion
      const passwordHash = Buffer.from(password).toString('base64');
      const newUser = await (prisma.user as any).create({
        data: {
          email: email,
          passwordHash: passwordHash,
          name: this.name || email.split('@')[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });
      
      console.log(`[BetterAuthService] signUp successful for: ${email}`);
      return { 
        status: "success", 
        message: "User successfully registered",
        user: { id: newUser.id, email: newUser.email }
      };
    } catch (error: any) {
      console.error(`[BetterAuthService] Error during signUp: ${error.message}`);
      return { status: "error", message: error.message };
    }
  }

  public async signOut(): Promise<any> {
    console.log(`[BetterAuthService] Signing out user: ${this.email}`);
    
    try {
      // Prisma ORM Query to delete all active sessions for the user
      await prisma.session.deleteMany({
        where: {
          user: { email: this.email }
        }
      });
      return { status: "success", message: "Logged out successfully" };
    } catch (error: any) {
      return { status: "error", message: error.message };
    }
  }

  public async authResponse(): Promise<any> {
    await simulateDelay(200);
    return { status: "success", message: "Authenticated successfully", userId: this.id };
  }
}
