import { BetterAuthService } from "./BetterAuthService";

export class BetterAuthClient {
  public email: string;
  public password: string;
  public name: string;

  private betterAuthService: BetterAuthService;

  constructor(email: string, password: string, name: string, betterAuthService: BetterAuthService) {
    this.email = email;
    this.password = password;
    this.name = name;
    this.betterAuthService = betterAuthService;
  }

  public async signIn(email: string, password: string): Promise<any> {
    console.log(`[BetterAuthClient] Initiating sign in for ${email}`);
    return await this.betterAuthService.signInWithEmail(email, password);
  }
  public async signUp(email: string, password: string, passwordConfirm: string): Promise<any> {
    console.log(`[BetterAuthClient] Initiating sign up for ${email}`);
    return await this.betterAuthService.signUpWithEmail(email, password, passwordConfirm);
  }
  public async signOut(): Promise<any> {
    return await this.betterAuthService.signOut();
  }
  public redirect(route: string): any {
    console.log(`[BetterAuthClient] Redirecting to ${route}`);
    return { redirectUrl: route };
  }
}
