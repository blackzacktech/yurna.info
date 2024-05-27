FROM node:21-slim AS base
RUN corepack enable

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Update alles und install wichtige sachen
RUN apt-get update -y && apt-get install -y openssl

# Copy das hier in Dockerfile
COPY . /home/app/
WORKDIR /home/app/

# Setup Database
RUN cd /home/app/packages/database/ && pnpm install

# Setup Dashboard
RUN cd /home/app/apps/dashboard/ && pnpm install

# Setup Bot
RUN cd /home/app/apps/bot/ && pnpm install

# back to app
RUN cd /home/app/



# Angaben der ENV daten
ENV TOKEN=""
ENV CLIENT_ID=""
ENV CLIENT_SECRET=""
ENV DISCORD_SUPPORT_SERVER_ID=""
ENV SECRET=""
ENV NEXTAUTH_URL=""
ENV NEXT_PUBLIC_URL=""
ENV HOTJAR_ID=""
ENV DATABASE_URL=""
ENV DIRECT_URL=""
ENV REDIS_URL=""
ENV TOPGG_API_KEY=""
ENV Fnbr=""
ENV FortniteTracker=""

EXPOSE 44078
CMD [ "pnpm", "run", "deploy" ]