# 🔁 Prompt de reprise — Backend NestJS Catalogue Produits

Ce document fournit le **contexte complet pour reprendre le développement** d’un backend NestJS servant une application catalogue produits.

L’objectif est d’apprendre **NestJS proprement** avec une architecture claire, sans copier-coller, en comprenant les concepts.

---

# 🎯 Objectif du projet

Construire une **API backend pour un catalogue produits**.

Au départ, le frontend utilisait :

https://fakestoreapi.com

L’objectif est maintenant de :

- créer **notre propre API backend**
- remplacer la fake API
- permettre **l’administration du catalogue produits**
- exposer une API consommée par un frontend Vue.

---

# 🧱 Stack technique

## Backend

- **NestJS**
- **TypeScript strict**
- **Prisma ORM v7**
- **PostgreSQL**
- **Docker / Docker Compose**
- **ESLint strict**

## Frontend (hors scope pour l’instant)

- Vue 3
- TypeScript
- Pinia
- Vuetify

---

# 🐳 Infrastructure

La base PostgreSQL est lancée avec **Docker Compose**.

Le compose contient :

- postgres
- pgadmin

Important avec Postgres récent :

/var/lib/postgresql

est utilisé comme volume.

---

# ⚙️ Configuration Prisma (v7)

Prisma v7 utilise maintenant :

prisma.config.ts

et plus la configuration datasource directement dans `schema.prisma`.

Exemple :

```ts
import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
```

Connexion runtime via :

- `@prisma/adapter-pg`
- `pg`

---

# 🗄️ Modèle de données

```prisma
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
```

---

# 🧠 Architecture NestJS

Architecture standard utilisée :

```
Controller
   ↓
Service
   ↓
PrismaService
   ↓
Database
```

Responsabilités :

### Controller
Expose les routes HTTP.

### Service
Contient la logique métier.

### PrismaService
Accès base de données.

### Module
Regroupe les controllers et services d’un domaine.

---

# 📂 Structure actuelle du backend

```
src
 ├ main.ts
 ├ app.module.ts
 │
 ├ prisma
 │   ├ prisma.module.ts
 │   └ prisma.service.ts
 │
 ├ health
 │   ├ health.module.ts
 │   ├ health.controller.ts
 │   └ health.service.ts
 │
 ├ categories
 │   ├ categories.module.ts
 │   ├ categories.controller.ts
 │   └ categories.service.ts
 │
 └ products
     ├ products.module.ts
     ├ products.controller.ts
     ├ products.service.ts
     └ dto
         └ products-service-response.ts
```

---

# 🧪 Endpoint Health

Endpoint :

```
GET /health
```

Objectif :

- vérifier la connexion DB
- faire `prisma.product.count()`

Retour attendu :

```json
{
  "status": "ok",
  "db": "up",
  "products": 10
}
```

Si la DB est KO → HTTP **503**.

---

# 📦 API actuelle

## Categories

```
GET /categories
```

Retour :

```
string[]
```

Implémentation :

- Prisma `category.findMany()`
- retourne seulement `name`

---

## Products

### Liste

```
GET /products
```

Retour :

```
Product[]
```

### Produit unique

```
GET /products/:id
```

Retour :

```
Product
```

Si non trouvé → **404**

---

# 📦 DTO exposé

```ts
export type Product = {
  id: number
  title: string
  price: number
  description: string
  category: string
  image: string
  rate: number
  rateCount: number
}
```

Les données Prisma sont transformées via un mapper :

```
productDB → Product DTO
```

---

# 🧹 Linting

ESLint strict avec :

- `typescript-eslint`
- `eslint-plugin-import`
- `eslint-plugin-unused-imports`
- `eslint-plugin-sonarjs`
- `eslint-plugin-security`

Règles importantes :

- pas de `any`
- return types explicites
- promises attendues
- import ordering
- détection code smells

Certaines règles sont assouplies pour Nest :

- modules Nest vides autorisés
- return type non obligatoire dans controllers

---

# 🚧 Étapes restantes du projet

## 1️⃣ Pagination produits

Ajouter :

```
GET /products?page=1&limit=20
```

via Prisma :

```
skip
take
```

---

## 2️⃣ DTO validation

Ajouter :

```
class-validator
class-transformer
```

pour valider les payloads.

---

## 3️⃣ CRUD admin produits

Endpoints :

```
POST /products
PATCH /products/:id
DELETE /products/:id
```

---

## 4️⃣ Authentification

Ajouter :

- JWT
- rôle ADMIN
- endpoint login

---

## 5️⃣ Interface admin frontend

Créer une section :

```
/admin
```

permettant de :

- gérer les produits
- gérer les catégories
- gérer les utilisateurs admin