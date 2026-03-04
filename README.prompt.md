# 🔁 Prompt de reprise — Projet Fullstack Vue + NestJS + Prisma

Ce document sert de **contexte de reprise** pour continuer le développement du projet avec une IA ou un autre développeur.

Il décrit :

- l'objectif du projet
- la stack utilisée
- ce qui est déjà implémenté
- ce qu'il reste à faire

---

# 🎯 Objectif du projet

Construire une application **catalogue produits**.

Initialement, le frontend utilisait l'API publique :

https://fakestoreapi.com

L'objectif est maintenant de :

- créer **notre propre API backend**
- remplacer la fake API
- permettre l'administration du catalogue produits
- créer éventuellement une **interface admin** côté frontend.

---

# 🧱 Stack technique

## Frontend

- Vue 3
- TypeScript strict
- Vite
- Pinia
- Vue Router
- Vuetify
- Vitest

## Backend

- NestJS
- Prisma ORM (v7)
- PostgreSQL
- Docker
- Docker Compose

---

# 📦 Architecture globale

Le projet est séparé en **deux repositories Git** :

frontend/   → application Vue 3  
backend/    → API NestJS

Le frontend consommera l'API NestJS.

Le travail actuel concerne **le backend**.

---

# 🐳 Infrastructure backend

La base de données PostgreSQL est lancée avec **Docker Compose**.

Le docker-compose contient :

- postgres
- pgadmin

Avec Postgres 18+, les données sont montées sur :

/var/lib/postgresql

et non plus :

/var/lib/postgresql/data

---

# ⚙️ Prisma (version 7)

Prisma v7 ne configure plus la connexion directement dans `schema.prisma`.

La configuration est maintenant dans :

prisma.config.ts

Exemple de configuration :

    import 'dotenv/config'
    import { defineConfig } from 'prisma/config'

    export default defineConfig({
      schema: 'prisma/schema.prisma',
      migrations: {
        path: 'prisma/migrations',
      },
      datasource: {
        url: process.env['DATABASE_URL'],
      },
    })

Connexion runtime via :

- @prisma/adapter-pg
- pg

---

# 🗄️ Modèle de données actuel

Structure Prisma actuelle :

    model Category {
      name     String    @unique
      products Product[]
    }

    model Product {
      id           Int      @id
      title        String
      price        Int
      description  String
      category     Category @relation(fields: [categoryName], references: [name])
      categoryName String
      image        String
      rate         Float
      rateCount    Int
    }

La base a été créée avec :

pnpm prisma migrate dev

---

# 🧱 Backend NestJS actuel

Structure actuelle :

src/
  main.ts
  app.module.ts
  prisma/
    prisma.service.ts
    prisma.module.ts

---

# PrismaService

Le service étend PrismaClient et configure l'adapter PostgreSQL.

    @Injectable()
    export class PrismaService extends PrismaClient {
      constructor() {
        const adapter = new PrismaPg({
          connectionString: process.env.DATABASE_URL as string,
        })

        super({ adapter })
      }
    }

---

# PrismaModule

Le module expose PrismaService pour l'injection dans NestJS.

    @Module({
      providers: [PrismaService],
      exports: [PrismaService],
    })
    export class PrismaModule {}

---

# 🧠 Concepts NestJS utilisés

Architecture NestJS :

Controller → Service → Prisma → Database

Concepts principaux :

Module  
Regroupe controllers et services d'un domaine.

Controller  
Gère les routes HTTP.

Service  
Contient la logique métier.

Dependency Injection  
Nest instancie automatiquement les services et les injecte.

---

# 🚧 Étapes restantes du projet

## 1 — Vérifier l'intégration Prisma

Créer un endpoint de test :

GET /health

qui effectue par exemple :

prisma.product.count()

---

## 2 — Créer les modules métier

Créer les modules :

products  
categories  

avec le CLI Nest :

nest g module products  
nest g controller products  
nest g service products  

et la même chose pour categories.

---

## 3 — Implémenter les endpoints

API publique :

GET /products  
GET /products/:id  
GET /categories  

API admin :

POST /products  
PATCH /products/:id  
DELETE /products/:id  

---

## 4 — Ajouter validation DTO

Utiliser :

class-validator  
class-transformer  

pour valider les payloads.

---

## 5 — Authentification admin

Ajouter :

- JWT authentication
- rôle ADMIN
- endpoint login

---

## 6 — Interface admin frontend

Créer une section `/admin` dans le frontend Vue permettant :

- gérer les produits
- gérer les catégories

---

# 🧭 Aide attendue pour la suite

Continuer l'implémentation **pas à pas** avec :

- explications pédagogiques NestJS
- architecture backend propre
- bonnes pratiques (DTO, services, modules)
- intégration correcte Prisma v7

Ne pas sauter d'étapes et expliquer les choix d'architecture.