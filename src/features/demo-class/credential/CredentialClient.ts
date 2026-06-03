import { CredentialService } from "./CredentialService";

export class CredentialClient {
  private credentialService: CredentialService;

  constructor(credentialService: CredentialService) {
    this.credentialService = credentialService;
  }

  public async searchCredential(apiKey: string): Promise<any> {
    return await this.credentialService.searchApiKey();
  }
  public async createCredential(name: string, apiKey: string): Promise<any> {
    return await this.credentialService.create(name, apiKey);
  }
  public async getMany(): Promise<any> {
    return await this.credentialService.getAll();
  }
  public async removeCredential(id: string): Promise<any> {
    return await this.credentialService.remove(id);
  }
}
