"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const spec = {
  openapi: "3.0.0",
  info: {
    title: "GitHub Wrapped API",
    version: "1.0.0",
    description: "API para geração e compartilhamento de relatórios GitHub Wrapped",
  },
  servers: [{ url: "/api", description: "Local / Production" }],
  components: {
    securitySchemes: {
      sessionAuth: {
        type: "apiKey",
        in: "cookie",
        name: "next-auth.session-token",
        description: "Autenticação via sessão NextAuth (login com GitHub)",
      },
    },
    schemas: {
      WrappedReport: {
        type: "object",
        properties: {
          cached: { type: "boolean" },
          generatedAt: { type: "string", format: "date-time" },
          data: {
            type: "object",
            properties: {
              year: { type: "integer" },
              totalCommits: { type: "integer" },
              totalRepos: { type: "integer" },
              totalStars: { type: "integer" },
              peakHour: { type: "integer" },
              peakDay: { type: "string" },
              longestStreak: { type: "integer" },
              personalityType: { type: "string" },
              personalityDescription: { type: "string" },
              mostActiveMonth: { type: "string" },
              topLanguages: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    count: { type: "integer" },
                    percentage: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  paths: {
    "/wrapped": {
      get: {
        summary: "Gerar ou buscar o Wrapped do usuário",
        tags: ["Wrapped"],
        security: [{ sessionAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "year",
            schema: { type: "integer", default: 2024 },
            description: "Ano do Wrapped",
          },
          {
            in: "query",
            name: "refresh",
            schema: { type: "boolean", default: false },
            description: "Forçar regeneração mesmo se cacheado",
          },
        ],
        responses: {
          200: {
            description: "Relatório gerado com sucesso",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/WrappedReport" },
              },
            },
          },
          401: { description: "Não autenticado" },
          500: { description: "Erro interno" },
        },
      },
    },
    "/share": {
      post: {
        summary: "Criar link de compartilhamento",
        tags: ["Share"],
        security: [{ sessionAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { year: { type: "integer" } },
                required: ["year"],
              },
            },
          },
        },
        responses: {
          201: { description: "Link criado com sucesso" },
          401: { description: "Não autenticado" },
          404: { description: "Relatório não encontrado — gere o Wrapped primeiro" },
        },
      },
      get: {
        summary: "Buscar Wrapped por slug público",
        tags: ["Share"],
        parameters: [
          {
            in: "query",
            name: "slug",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Relatório encontrado" },
          404: { description: "Link não encontrado" },
        },
      },
    },
    "/og": {
      get: {
        summary: "Gerar imagem OG compartilhável",
        tags: ["OG Image"],
        parameters: [
          { in: "query", name: "username", schema: { type: "string" } },
          { in: "query", name: "commits", schema: { type: "string" } },
          { in: "query", name: "language", schema: { type: "string" } },
          { in: "query", name: "personality", schema: { type: "string" } },
          { in: "query", name: "year", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Imagem PNG gerada",
            content: { "image/png": {} },
          },
        },
      },
    },
  },
};

export default function DocsPage() {
  return (
    <div className="swagger-wrapper">
      <SwaggerUI spec={spec} />
      <style>{`
        .swagger-wrapper { background: #fff; min-height: 100vh; }
      `}</style>
    </div>
  );
}
