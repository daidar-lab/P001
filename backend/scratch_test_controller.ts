
import { Request, Response } from 'express';
import * as relatoriosController from './src/modules/relatorios/relatorios.controller';
import prisma from './src/config/database';

async function testListar() {
  const req = {
    query: { page: '1', limit: '20' }
  } as any;

  const res = {
    json: (data: any) => {
      console.log("Response JSON:", JSON.stringify(data, null, 2));
    }
  } as any;

  try {
    console.log("Testando relatoriosController.listar...");
    await relatoriosController.listar(req, res, (err: any) => console.error("Next called with error:", err));
  } catch (error) {
    console.error("Erro no teste:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testListar();
