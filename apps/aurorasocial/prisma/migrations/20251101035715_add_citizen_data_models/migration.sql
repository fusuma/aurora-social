-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GESTOR', 'TECNICO');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

-- CreateEnum
CREATE TYPE "Parentesco" AS ENUM ('RESPONSAVEL', 'CONJUGE', 'FILHO', 'ENTEADO', 'NETO', 'PAI_MAE', 'SOGRO_SOGRA', 'IRMAO_IRMA', 'GENRO_NORA', 'OUTRO');

-- CreateEnum
CREATE TYPE "TipoDemanda" AS ENUM ('BENEFICIO_EVENTUAL', 'CADASTRO_UNICO', 'BPC', 'BOLSA_FAMILIA', 'ORIENTACAO_SOCIAL', 'ENCAMINHAMENTO_SAUDE', 'ENCAMINHAMENTO_EDUCACAO', 'VIOLACAO_DIREITOS', 'OUTRO');

-- CreateTable
CREATE TABLE "Municipality" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Municipality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT 'TECNICO',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Familia" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "responsavelFamiliarId" TEXT NOT NULL,
    "endereco" TEXT NOT NULL,
    "rendaFamiliarTotal" DECIMAL(10,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Familia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Individuo" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "sexo" "Sexo" NOT NULL,
    "nomeMae" TEXT,
    "nis" TEXT,
    "rg" TEXT,
    "tituloEleitor" TEXT,
    "carteiraTrabalho" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Individuo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComposicaoFamiliar" (
    "id" TEXT NOT NULL,
    "familiaId" TEXT NOT NULL,
    "individuoId" TEXT NOT NULL,
    "parentesco" "Parentesco" NOT NULL,

    CONSTRAINT "ComposicaoFamiliar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Atendimento" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "individuoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipoDemanda" "TipoDemanda" NOT NULL,
    "encaminhamento" TEXT NOT NULL,
    "parecerSocial" TEXT NOT NULL,

    CONSTRAINT "Atendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anexo" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "blobUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uploadedBy" TEXT NOT NULL,
    "familiaId" TEXT,
    "individuoId" TEXT,

    CONSTRAINT "Anexo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Municipality_cnpj_key" ON "Municipality"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_tenantId_role_idx" ON "User"("tenantId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Familia_tenantId_idx" ON "Familia"("tenantId");

-- CreateIndex
CREATE INDEX "Familia_tenantId_responsavelFamiliarId_idx" ON "Familia"("tenantId", "responsavelFamiliarId");

-- CreateIndex
CREATE INDEX "Individuo_tenantId_idx" ON "Individuo"("tenantId");

-- CreateIndex
CREATE INDEX "Individuo_tenantId_nomeCompleto_idx" ON "Individuo"("tenantId", "nomeCompleto");

-- CreateIndex
CREATE UNIQUE INDEX "Individuo_tenantId_cpf_key" ON "Individuo"("tenantId", "cpf");

-- CreateIndex
CREATE UNIQUE INDEX "ComposicaoFamiliar_familiaId_individuoId_key" ON "ComposicaoFamiliar"("familiaId", "individuoId");

-- CreateIndex
CREATE INDEX "Atendimento_tenantId_data_idx" ON "Atendimento"("tenantId", "data");

-- CreateIndex
CREATE INDEX "Atendimento_tenantId_individuoId_idx" ON "Atendimento"("tenantId", "individuoId");

-- CreateIndex
CREATE INDEX "Anexo_tenantId_idx" ON "Anexo"("tenantId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Familia" ADD CONSTRAINT "Familia_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Familia" ADD CONSTRAINT "Familia_responsavelFamiliarId_fkey" FOREIGN KEY ("responsavelFamiliarId") REFERENCES "Individuo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Individuo" ADD CONSTRAINT "Individuo_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Municipality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComposicaoFamiliar" ADD CONSTRAINT "ComposicaoFamiliar_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "Familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComposicaoFamiliar" ADD CONSTRAINT "ComposicaoFamiliar_individuoId_fkey" FOREIGN KEY ("individuoId") REFERENCES "Individuo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_individuoId_fkey" FOREIGN KEY ("individuoId") REFERENCES "Individuo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendimento" ADD CONSTRAINT "Atendimento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_familiaId_fkey" FOREIGN KEY ("familiaId") REFERENCES "Familia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anexo" ADD CONSTRAINT "Anexo_individuoId_fkey" FOREIGN KEY ("individuoId") REFERENCES "Individuo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

