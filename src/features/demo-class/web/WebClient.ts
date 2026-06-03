import { BetterAuthClient } from "../auth/BetterAuthClient";
import { CredentialClient } from "../credential/CredentialClient";
import { NodeClient } from "../node/NodeClient";
import { executionClient } from "../execution/executionClient";
import { workflowService } from "../workflow/workflowService";
import { workflowClient } from "../workflow/workflowClient";

export class WebClient {
  private betterAuthClient: BetterAuthClient;
  private credentialClient: CredentialClient;
  private nodeClient: NodeClient;
  private executionClientInstance: executionClient;
  private workflowServiceInstance: workflowService;

  private workflowClientInstance: workflowClient;

  constructor(
    betterAuthClient: BetterAuthClient,
    credentialClient: CredentialClient,
    nodeClient: NodeClient,
    executionClientInstance: executionClient,
    workflowServiceInstance: workflowService,
    workflowClientInstance: workflowClient
  ) {
    this.betterAuthClient = betterAuthClient;
    this.credentialClient = credentialClient;
    this.nodeClient = nodeClient;
    this.executionClientInstance = executionClientInstance;
    this.workflowServiceInstance = workflowServiceInstance;
    this.workflowClientInstance = workflowClientInstance;
  }

  public redirect(route: string): any {
    return this.betterAuthClient.redirect(route);
  }
  public async onClick(contextOrId?: string, isConfirmed?: boolean): Promise<any> {
    console.log("[WebClient] Click event");
    
    // Flow: Create workflow
    if (contextOrId === "create_workflow") {
      await this.workflowClientInstance.createWorkflow();
      this.redirect("/workflows"); // Or some route
      return;
    }

    // Flow: Execute workflow
    if (contextOrId === "execute" && typeof isConfirmed === "string") {
      const workflowId = isConfirmed; // Reuse isConfirmed parameter for workflowId in this context
      const isValid = await this.workflowClientInstance.executeWorkflow(workflowId, (status) => {
        this.setNodeIndicator(status);
      });

      if (!isValid) {
        this.showValidationError();
      }
      return;
    }

    // Flow: View all credentials
    if (contextOrId === "credential") {
      const creds = await this.credentialClient.getMany();
      this.showAll(creds);
      return;
    }
    
    // Flow: View all workflows
    if (contextOrId === "workflow") {
      const workflows = await this.workflowClientInstance.getMany();
      this.showAll(workflows);
      return;
    }

    // Flow: Default / Logout dialog
    if (!contextOrId) {
      this.showDialog();
      return;
    }

    // Flow: Remove credential or workflow by ID
    const entityId = contextOrId;
    const isWorkflowId = entityId.startsWith("wf-"); // Mock condition to distinguish
    this.showDialog();

    if (isConfirmed !== undefined) {
      if (isConfirmed) {
        if (isWorkflowId) {
          await this.workflowClientInstance.removeWorkflow(entityId);
        } else {
          await this.credentialClient.removeCredential(entityId);
        }
        this.closeDialog();
      } else {
        this.closeDialog();
      }
    }
  }
  public showValidationError(): any {
    return { error: "Validation failed" };
  }
  public showNotification(message: string): any {
    console.log(`[WebClient] Notification: ${message}`);
  }
  public async validateForm(): Promise<boolean> {
    return true; // Simulating valid form
  }
  public showDialog(): any {
    console.log("[WebClient] Showing dialog");
  }
  public async onSubmit(
    emailOrName?: string | any, // Can be dataJson
    passwordOrApiKey?: string, 
    confirmPassword?: string, 
    context: "auth" | "credential" | "logout" | "node" = "auth",
    isConfirmed: boolean = true
  ): Promise<any> {
    console.log("[WebClient] Form submitted");
    
    // Node settings flow
    if (context === "node" && emailOrName) {
      const dataJson = emailOrName;
      await this.nodeClient.saveNode(dataJson);
      this.closeDialog();
      return;
    }
    
    // Create Credential Flow
    if (context === "credential" && emailOrName && passwordOrApiKey) {
      await this.credentialClient.createCredential(emailOrName, passwordOrApiKey);
      return;
    }

    // Sign Out Flow (No credentials provided)
    if (!emailOrName && !passwordOrApiKey) {
      if (isConfirmed) {
        await this.betterAuthClient.signOut();
        this.redirect("/");
      } else {
        this.showDialog();
      }
      return;
    }

    const isValid = await this.validateForm();
    
    if (!isValid) {
      this.showValidationError();
      return;
    }

    // Registration Flow
    if (emailOrName && passwordOrApiKey && confirmPassword) {
      const response = await this.betterAuthClient.signUp(emailOrName, passwordOrApiKey, confirmPassword);
      
      if (response && response.status === "success") {
        this.redirect("/dashboard");
      } else {
        this.showNotification(response?.message || "Registration failed");
      }
    } 
    // Login Flow
    else if (emailOrName && passwordOrApiKey) {
      const response = await this.betterAuthClient.signIn(emailOrName, passwordOrApiKey);
      
      if (response && response.status === "success") {
        this.redirect("/dashboard");
      } else {
        this.showNotification(response?.message || "Login failed");
      }
    }
  }
  public closeDialog(): any {
    console.log("[WebClient] Closing dialog");
  }
  public showAll(data?: any): any {
    console.log("[WebClient] Show all", data);
  }
  public setNodeIndicator(status: string): any {
    console.log(`[WebClient] Node indicator set to: ${status}`);
  }
  public onDoubleClick(): any {
    console.log("[WebClient] Double click event");
    this.showDialog();
  }
}
