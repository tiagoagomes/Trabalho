function processCsvRow(row) {
  const nome = row.nome?.trim();
  const cep = row.cep?.trim();
  const cpf = row.cpf?.trim();

  if (!nome || !cep || !cpf) {
    return null;
  }

  return { nome, cep, cpf };
}

module.exports = { processCsvRow };
