const fs = require('fs');
const path = require('path');

const STUDENTS = [
  { id: 'ALUNO-101', name: 'Ana Paula Rezende', uf: 'SP' },
  { id: 'ALUNO-102', name: 'Carlos Eduardo Pires', uf: 'RJ' },
  { id: 'ALUNO-103', name: 'Juliana Mendes Castro', uf: 'MG' },
  { id: 'ALUNO-104', name: 'Felipe Siqueira', uf: 'PR' },
  { id: 'ALUNO-105', name: 'Beatriz Fonseca', uf: 'RS' },
  { id: 'ALUNO-106', name: 'Rodrigo Alencar', uf: 'BA' },
  { id: 'ALUNO-107', name: 'Mariana Lacerda', uf: 'CE' },
  { id: 'ALUNO-108', name: 'Guilherme Bastos', uf: 'SC' },
  { id: 'ALUNO-109', name: 'Camila Nogueira', uf: 'DF' },
  { id: 'ALUNO-110', name: 'Lucas Vasconcelos', uf: 'PE' },
  { id: 'ALUNO-111', name: 'Diego Antunes', uf: 'GO' },
  { id: 'ALUNO-112', name: 'Larissa Meireles', uf: 'SP' },
  { id: 'ALUNO-113', name: 'Thiago Guedes', uf: 'MG' },
  { id: 'ALUNO-114', name: 'Vanessa Trindade', uf: 'ES' },
  { id: 'ALUNO-115', name: 'Bruno Fagundes', uf: 'RJ' },
  { id: 'ALUNO-116', name: 'Renan Paiva', uf: 'SP' },
  { id: 'ALUNO-117', name: 'Sabrina Teles', uf: 'RS' },
  { id: 'ALUNO-118', name: 'Vinicius Morais', uf: 'CE' },
  { id: 'ALUNO-119', name: 'Natalia Dorneles', uf: 'PR' },
  { id: 'ALUNO-120', name: 'Marcelo Bittencourt', uf: 'SP' },
  { id: 'ALUNO-121', name: 'Aline Caldeira', uf: 'RJ' },
  { id: 'ALUNO-122', name: 'Alexandre Farias', uf: 'SP' },
  { id: 'ALUNO-123', name: 'Tatiane Aragao', uf: 'BA' },
  { id: 'ALUNO-124', name: 'Caio Mendonca', uf: 'MG' },
  { id: 'ALUNO-125', name: 'Priscila Lovato', uf: 'SC' },
  { id: 'ALUNO-126', name: 'Eduardo Xavier', uf: 'DF' },
  { id: 'ALUNO-127', name: 'Isabela Campana', uf: 'SP' },
  { id: 'ALUNO-128', name: 'Daniel Gusmao', uf: 'PE' },
  { id: 'ALUNO-129', name: 'Patricia Valente', uf: 'GO' },
  { id: 'ALUNO-130', name: 'Lucas Silveira', uf: 'RJ' },
  { id: 'ALUNO-131', name: 'Fernando Diniz', uf: 'SP' },
  { id: 'ALUNO-132', name: 'Gabriela Ramos', uf: 'MG' },
  { id: 'ALUNO-133', name: 'Henrique Prado', uf: 'PR' },
  { id: 'ALUNO-134', name: 'Renata Frota', uf: 'CE' },
  { id: 'ALUNO-135', name: 'Gustavo Linhares', uf: 'RS' },
  { id: 'ALUNO-136', name: 'Jessica Brandao', uf: 'SC' },
  { id: 'ALUNO-137', name: 'Marcio Toledo', uf: 'BA' },
  { id: 'ALUNO-138', name: 'Debora Freitas', uf: 'PE' },
  { id: 'ALUNO-139', name: 'Wesley Pinheiro', uf: 'DF' },
  { id: 'ALUNO-140', name: 'Vivian Machado', uf: 'SP' },
  { id: 'ALUNO-141', name: 'Samuel Barbosa', uf: 'SP' },
  { id: 'ALUNO-142', name: 'Luana Guimaraes', uf: 'RJ' },
  { id: 'ALUNO-143', name: 'Matheus Coimbra', uf: 'MG' },
  { id: 'ALUNO-144', name: 'Amanda Esteves', uf: 'ES' },
  { id: 'ALUNO-145', name: 'Cristiano Borges', uf: 'GO' },
  { id: 'ALUNO-146', name: 'Bruna Salgado', uf: 'RS' },
  { id: 'ALUNO-147', name: 'Leandro Rocha', uf: 'PR' },
  { id: 'ALUNO-148', name: 'Milena Campos', uf: 'SC' },
  { id: 'ALUNO-149', name: 'Rafaela Peixoto', uf: 'CE' },
  { id: 'ALUNO-150', name: 'Otavio Neves', uf: 'BA' },
];

const COURSES = [
  { name: 'Formação Fullstack & IA', price: 'R$ 997,00' },
  { name: 'Imersão em SQL & Data Analytics', price: 'R$ 497,00' },
  { name: 'Certificação Cloud & DevOps', price: 'R$ 1.490,00' },
  { name: 'Mentoria Executiva Tech 1on1', price: 'R$ 2.490,00' },
  { name: 'Assinatura Comunidade Tech Pro (Mensal)', price: 'R$ 97,00' },
  { name: 'Workshop de Product Management', price: 'R$ 297,00' },
];

const PAYMENTS = ['pix', 'credit_card', 'credit_card', 'boleto'];

const rows = ['id_transacao,id_aluno,nome_completo,uf_residencia,data_matricula,valor_pago,categoria_curso,forma_pagamento'];

let trxId = 1;

// Distribute over 14 months (Jan 2025 to Feb 2026)
for (let month = 0; month < 14; month++) {
  STUDENTS.forEach((student, sIdx) => {
    const studentJoinMonth = sIdx % 8; // Jan to Aug
    if (month < studentJoinMonth) return;

    if (month === studentJoinMonth) {
      // First course purchase
      const course = COURSES[sIdx % COURSES.length];
      const day = ((sIdx * 3 + month) % 25) + 1;
      const d = new Date(2025, month, day, 10 + (sIdx % 10), (sIdx * 7) % 60);
      const payment = PAYMENTS[sIdx % PAYMENTS.length];

      // Note: wrap values in quotes so commas in price or title don't split columns
      rows.push(
        `"${String(trxId++).padStart(5, '0')}","${student.id}","${student.name}","${student.uf}","${d.toISOString()}","${course.price}","${course.name}","${payment}"`
      );
    } else {
      // Retention / subsequent purchases
      const roll = ((sIdx * 17 + month * 23) % 100) / 100;
      if (roll > 0.45) {
        const isSub = roll > 0.70;
        const course = isSub ? COURSES[4] : COURSES[(sIdx + month) % COURSES.length];
        const day = ((sIdx * 5 + month * 2) % 27) + 1;
        const d = new Date(2025, month, day, 9 + (sIdx % 12), (month * 11) % 60);
        const payment = PAYMENTS[(sIdx + month) % PAYMENTS.length];

        rows.push(
          `"${String(trxId++).padStart(5, '0')}","${student.id}","${student.name}","${student.uf}","${d.toISOString()}","${course.price}","${course.name}","${payment}"`
        );
      }
    }
  });
}

const outputPath = path.join(__dirname, '..', 'public', 'sample-datasets', 'edtech_digital_subscriptions.csv');
fs.writeFileSync(outputPath, rows.join('\n'), 'utf8');
console.log(`Regenerated ${rows.length - 1} transactions with quoted values to ${outputPath}`);
