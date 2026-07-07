import type { NodeType } from "@prisma/client";
import { TemplateRepository } from "../infra/template.repository";

export class TemplateService {
  private repository: TemplateRepository;

  constructor() {
    this.repository = new TemplateRepository();
  }

  async createTemplate(
    userId: string,
    name: string,
    description: string | undefined,
    nodeType: NodeType,
    config: any,
  ) {
    return this.repository.create(userId, name, description, nodeType, config);
  }

  async updateTemplate(
    id: string,
    userId: string,
    name: string,
    description: string | undefined,
    config: any,
  ) {
    return this.repository.update(id, userId, name, description, config);
  }

  async deleteTemplate(id: string, userId: string) {
    return this.repository.delete(id, userId);
  }

  async getAllTemplates(userId: string) {
    return this.repository.getAllByUserId(userId);
  }

  async getTemplatesByNodeType(userId: string, nodeType: NodeType) {
    return this.repository.getByNodeType(userId, nodeType);
  }

  async getTemplateById(id: string, userId: string) {
    return this.repository.getByIdAndUser(id, userId);
  }
}

export const templateService = new TemplateService();
