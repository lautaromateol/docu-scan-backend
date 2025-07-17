import * as pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';
import { extname } from 'path';
import { LLM_CONFIG } from 'config/llm.config';
import { z } from 'zod';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Groq } from 'groq-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { ContractSchema } from './types/create-contract';
import { normalizeContractData, parseJsonFromLlmResponse } from 'lib/utils';
import { MembersService } from '../members/members.service';

@Injectable()
export class ContractsService {
  private groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  constructor(
    private prismaService: PrismaService,
    private membersService: MembersService,
  ) {}

  async getContracts({
    workspaceId,
    userId,
  }: {
    workspaceId: string;
    userId: string;
  }) {
    const member = await this.membersService.getMember({ workspaceId, userId });

    if (!member) {
      throw new UnauthorizedException();
    }

    const contracts = await this.prismaService.contract.findMany({
      where: {
        workspaceId,
      },
      include: {
        parties: true,
        obligations: true,
      },
    });

    return {
      statusCode: 200,
      contracts,
    };
  }

  async uploadContract({
    workspaceId,
    file,
  }: {
    file: Express.Multer.File;
    workspaceId: string;
  }) {
    const text = await this.parseToString(file);

    const contract = await this.extractContractData({ text, workspaceId });

    return {
      statusCode: 200,
      contract,
    };
  }

  async extractContractData({
    text,
    workspaceId,
  }: {
    text: string;
    workspaceId: string;
  }) {
    const prompt = this.buildPrompt(text);

    const completion = await this.groqClient.chat.completions.create({
      model: LLM_CONFIG.model,
      temperature: LLM_CONFIG.temperature,
      max_completion_tokens: LLM_CONFIG.max_completion_tokens,
      top_p: LLM_CONFIG.top_p,
      stream: false,
      stop: LLM_CONFIG.stop,
      messages: [
        {
          role: 'system',
          content:
            'Eres un analista legal experto. Analiza contratos y responde con JSON estructurado compatible con una base de datos.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0].message.content;

    if (!content) {
      throw new BadRequestException();
    }

    let normalized;
    try {
      const parsed = parseJsonFromLlmResponse(content);
      normalized = normalizeContractData(parsed);
    } catch (e) {
      throw new BadRequestException(e.message);
    }

    const validated = ContractSchema.safeParse(normalized);
    if (!validated.success) {
      throw new BadRequestException(validated.error.message);
    }

    const result = await this.createContract({
      contractDto: validated.data,
      workspaceId,
    });
    return result;
  }

  private buildPrompt(contractText: string): string {
    return `Se te proporciona el texto completo de un contrato. Devuelve solamente un objeto JSON con la estructura exacta que te voy a proporcionar. No devuelvas nada mas que el JSON:

{
  "title": string,
  "category": one of ["TRANSFER", "USE", "SERVICES", "GUARANTEE", "COLABORATION"],
  "status": one of ["DRAFT", "SIGNED", "EXPIRED", "TERMINATED"],
  "descriptionSummary": string,
  "jurisdiction": string | null,
  "governingLaw": string | null,
  "signingDate": ISO 8601 date | null,
  "startDate": ISO 8601 date | null,
  "endDate": ISO 8601 date | null,
  "parties": [
    {
      "name": string,
      "identifier": string | null,
      "role": string
    }
  ],
  "obligations": [
    {
      "partyName": string (must match a party.name),
      "description": string,
      "type": one of ["PRIMARY", "ACCESSORY", "CONDITIONAL", "RECURRING"],
      "dueDate": ISO 8601 date | null,
      "recurrence": string | null
    }
  ],
  "terminationClauses": [
    {
      "description": string,
      "cause": string,
      "noticePeriodDays": integer | null
    }
  ],
  "deadlines": [
    {
      "description": string,
      "date": ISO 8601 date,
      "type": string
    }
  ],
  "clauses": [
    {
      "title": string,
      "bodyText": string,
      "clauseType": one of ["GENERAL", "CONFIDENTIALITY", "PENALTY", "JURISDICTION", "OTHER"]
    }
  ]
}

Texto del contrato:
---
${contractText}
---`;
  }

  async createContract({
    contractDto,
    workspaceId,
  }: {
    contractDto: z.infer<typeof ContractSchema>;
    workspaceId: string;
  }) {
    return this.prismaService.$transaction(async (tx) => {
      const contract = await tx.contract.create({
        data: {
          workspaceId,
          title: contractDto.title,
          category: contractDto.category,
          descriptionSummary: contractDto.descriptionSummary,
          jurisdiction: contractDto.jurisdiction,
          governingLaw: contractDto.governingLaw,
          signingDate: contractDto.signingDate,
          startDate: contractDto.startDate,
          endDate: contractDto.endDate,
          status: contractDto.status ?? 'DRAFT',
        },
      });

      // 2. Crear partes (ContractParty)
      const savedParties = await Promise.all(
        contractDto.parties.map((party) =>
          tx.contractParty.create({
            data: {
              contractId: contract.id,
              name: party.name,
              identifier: party.identifier,
              role: party.role,
            },
          }),
        ),
      );

      // 3. Crear mapa para buscar partyId por name o role
      const partyMap = new Map<string, string>();
      for (const party of savedParties) {
        partyMap.set(party.name.trim(), party.id);
        partyMap.set(party.role.trim(), party.id);
      }

      // 4. Crear obligaciones con partyId vinculado
      const obligationsWithPartyId = (contractDto.obligations || []).map(
        (o) => {
          const partyId = partyMap.get(o.partyName?.trim()) ?? null;

          if (!partyId) {
            throw new Error(`No se encontró partyId para "${o.partyName}"`);
          }

          return {
            contractId: contract.id,
            partyId,
            description: o.description,
            type: o.type,
            dueDate: o.dueDate ?? null,
            recurrence: o.recurrence ?? null,
          };
        },
      );

      await tx.obligation.createMany({
        data: obligationsWithPartyId,
      });

      // 5. Crear termination clauses
      await tx.terminationClause.createMany({
        data: (contractDto.terminationClauses || []).map((tc) => ({
          contractId: contract.id,
          description: tc.description,
          cause: tc.cause ?? '',
          noticePeriodDays: tc.noticePeriodDays ?? null,
        })),
      });

      // 6. Crear deadlines
      await tx.contractDeadline.createMany({
        data: (contractDto.deadlines || []).map((d) => ({
          contractId: contract.id,
          description: d.description,
          date: d.date,
          type: d.type,
        })),
      });

      // 7. Crear cláusulas
      await tx.contractClause.createMany({
        data: (contractDto.clauses || []).map((c) => ({
          contractId: contract.id,
          title: c.title,
          bodyText: c.bodyText,
          clauseType: c.clauseType,
        })),
      });

      return contract;
    });
  }

  async parseToString(file: Express.Multer.File) {
    const ext = extname(file.originalname).toLowerCase();
    const buffer = file.buffer;
    let text = '';

    if (ext === '.pdf') {
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (ext === '.docx') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (ext === '.txt') {
      text = buffer.toString('utf-8');
    } else {
      throw new UnsupportedMediaTypeException('Format not supported.');
    }

    return text;
  }
}
