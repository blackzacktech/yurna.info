-- CreateTable
CREATE TABLE "guild_partners" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "has_banner" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guild_partners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "guild_partners" ADD CONSTRAINT "guild_partners_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;
