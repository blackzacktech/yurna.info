-- AlterTable
ALTER TABLE "guild_partners" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "partner_guild_id" TEXT,
ADD COLUMN     "partnership_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "guild_partners" ADD CONSTRAINT "guild_partners_partner_guild_id_fkey" FOREIGN KEY ("partner_guild_id") REFERENCES "guilds"("guild_id") ON DELETE SET NULL ON UPDATE CASCADE;
