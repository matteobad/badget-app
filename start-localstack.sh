# load env
set -a
. .env
set +a

# setup
docker-compose up -d --wait

# db
pnpm db:push
# pnpm db:migrate
pnpm db:seed

# run
#pnpm run dev