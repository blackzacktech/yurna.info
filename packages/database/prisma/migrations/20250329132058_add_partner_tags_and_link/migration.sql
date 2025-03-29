-- AlterTable
ALTER TABLE "guild_partners" ADD COLUMN     "public_link" TEXT,
ADD COLUMN     "tags" JSONB NOT NULL DEFAULT '[]';
