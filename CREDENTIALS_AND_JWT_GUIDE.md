# Credenciais, JWT e Tipos de Users

## 1. Como se Guardam as Credenciais na Base de Dados

### 🔐 Hashing com Bcrypt

As passwords **NÃO** são guardadas em texto plano! Usamos **Bcrypt** com 12 rounds de hashing.

#### Processo de Registo/Criação:

```typescript
// 1. Quando um doctor é criado com uma password:
const doctor = new Doctor({
  email: 'joao@clinic.com',
  password: 'MyPassword123'  // ← Password em texto plano
});

// 2. Antes de guardar na BD, o pre-save hook faz hashing:
doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  // Hash com 12 rounds (bcryptjs)
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  next();
});

// 3. Guardado na BD:
// {
//   email: 'joao@clinic.com',
//   password: '$2a$12$e7rN8xQs6qU9y2L1m0vN.eX5kL9oP8mZ7cQ4nR3bS2aT1hU0gV9..' ← HASH
// }
```

#### Processo de Login:

```typescript
// 1. User envia: email + password
// 2. Backend procura o doctor pela email
const doctor = await Doctor.findOne({ email }).select('+password');
// Nota: select('+password') porque password é hidden por default

// 3. Compara a password com hash usando bcrypt:
const isMatch = await bcrypt.compare(
  'MyPassword123',  // ← Password enviada pelo user
  doctor.password   // ← Hash guardado na BD
);

// 4. Se match = true → Login bem-sucedido
// 5. Se match = false → "Invalid credentials"
```

### 📊 O que se Guarda na BD:

```
Collection: doctors
{
  _id: ObjectId("..."),
  organization: ObjectId("..."),
  firstName: "João",
  lastName: "Silva",
  email: "joao@clinic.com",
  password: "$2a$12$abcdef123456...",  ← HASHED PASSWORD
  phone: "+351-912345678",
  specialization: "Clinical Psychology",
  licenseNumber: "PSY-2024-001",
  role: "owner",
  permissions: {
    canManageOrganization: true,
    canManageDoctors: true,
    canViewAllPatients: true,
    canManageBilling: true
  },
  isActive: true,
  lastLogin: ISODate("2024-01-14T10:30:00Z"),
  createdAt: ISODate("2024-01-14T09:00:00Z"),
  updatedAt: ISODate("2024-01-14T10:30:00Z")
}
```

### 🔒 Segurança

- ✅ Passwords nunca são transmitidas em texto plano (HTTPS em produção)
- ✅ Passwords são hashadas com 12 rounds (muito seguro)
- ✅ Mesmo que alguém aceda à BD, não consegue saber a password
- ✅ Passwords não são retornadas em queries (select: false)

---

## 2. Como se Gera a JWT Key

### 🔑 JWT (JSON Web Token)

JWT é um token **stateless** que verifica se o user está autenticado, sem precisar de guardar sessões no servidor.

#### Estrutura do JWT:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJkb2N0b3JJZCI6IjEyMzQ1Njc4OTAiLCJvcmdhbml6YXRpb25JZCI6ImFiY2RlZiIsImVtYWlsIjoiam9hb0BjbGluaWMuY29tIiwicm9sZSI6Im93bmVyIiwiaWF0IjoxNjA0NjUwMDAwLCJleHAiOjE2MDUyNTQwMDB9.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

│                                       │
└─ Header ──────────────────────────────────── Payload ─────────────────────────────────────── Signature ─┘
   Tipo de Token                        Dados do User (claims)                          Validação
   Algoritmo                            Válido até (exp)
```

#### Processo de Login - Geração do JWT:

```typescript
// 1. No authController.ts - login endpoint:
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // 2. Procura o doctor
  const doctor = await Doctor.findOne({ email }).select('+password');
  if (!doctor) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // 3. Verifica password
  const isMatch = await doctor.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // 4. GERA O JWT:
  const token = generateToken(doctor._id, doctor.organization, doctor.email, doctor.role);

  // 5. Retorna o token ao cliente
  res.json({
    token,
    doctor: doctor.toObject({ transform: false, flattenMaps: true }),
    organization: await Organization.findById(doctor.organization)
  });
};

// FUNÇÃO QUE GERA O JWT:
export const generateToken = (
  doctorId: string,
  organizationId: string,
  email: string,
  role: string
): string => {
  // 1. Cria o payload (dados a guardar no token)
  const payload: JwtPayload = {
    doctorId: doctorId.toString(),
    organizationId: organizationId.toString(),
    email,
    role,
  };

  // 2. Assina com a JWT_SECRET (chave privada)
  // Válido por 7 dias (7 * 24 * 60 * 60 = 604800 segundos)
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // ← EXPIRAÇÃO
  });

  return token;
};
```

### 📝 Payload do JWT:

```json
{
  "doctorId": "507f1f77bcf86cd799439011",
  "organizationId": "507f1f77bcf86cd799439012",
  "email": "joao@clinic.com",
  "role": "owner",
  "iat": 1705244400,  // Issued At (quando foi criado)
  "exp": 1705849200   // Expiration (quando expira - 7 dias depois)
}
```

### 🔐 JWT_SECRET

A `JWT_SECRET` é a chave privada usada para assinar o token. Qualquer um com esta chave consegue forjar tokens!

#### Gerar uma JWT_SECRET segura:

```bash
# Opção 1: Usar Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Exemplo de output:
# a7f8e9c3d4b2f1a6e8c9d0b1f2a3e4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0

# Opção 2: PowerShell
$bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64)
[System.BitConverter]::ToString($bytes).Replace('-','').ToLower()
```

#### .env do backend:

```env
# Nunca guardes isto publicamente!
JWT_SECRET=a7f8e9c3d4b2f1a6e8c9d0b1f2a3e4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0

# Muda em PRODUÇÃO! Nunca uses o mesmo secret em dev e produção
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/psychology-clinic
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### ✓ Processo de Autenticação com JWT:

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTE (BROWSER)                          │
└─────────────────────────────────────────────────────────────────┘
           │
           │ 1. Login com email + password
           ↓
┌─────────────────────────────────────────────────────────────────┐
│ POST /api/auth/login                                            │
│ { email, password }                                             │
└─────────────────────────────────────────────────────────────────┘
           │
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVIDOR (EXPRESS)                         │
│                                                                 │
│ 1. Procura doctor por email                                     │
│ 2. Valida password com bcrypt.compare()                         │
│ 3. GERA JWT token                                               │
│    jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })          │
│ 4. Retorna token                                                │
└─────────────────────────────────────────────────────────────────┘
           │
           │ 2. Recebe token
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTE (BROWSER)                          │
│                                                                 │
│ 1. Guarda token em localStorage                                 │
│    localStorage.setItem('authToken', token)                     │
│ 2. Em cada request subsequente, envia:                          │
│    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... │
└─────────────────────────────────────────────────────────────────┘
           │
           │ 3. Acessa recurso protegido com token
           │ GET /api/patients
           │ Authorization: Bearer <token>
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SERVIDOR (EXPRESS)                         │
│                    middleware: authenticate                     │
│                                                                 │
│ 1. Extrai token do header                                       │
│ 2. VERIFICA token com JWT_SECRET                                │
│    jwt.verify(token, JWT_SECRET)                                │
│ 3. Se válido:                                                   │
│    ✓ Carrega doctor data                                        │
│    ✓ Carrega organization data                                  │
│    ✓ Valida se doctor é ativo                                   │
│    ✓ Valida se organization é ativa                             │
│    ✓ Valida se subscription é ativa                             │
│ 4. Permite continuação do request                               │
│                                                                 │
│ Se inválido ou expirado:                                        │
│ ✗ Retorna 401 Unauthorized                                      │
└─────────────────────────────────────────────────────────────────┘
           │
           │ 4. Retorna dados
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTE (BROWSER)                          │
│ Mostra dados do patient                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 🕐 Expiração do Token

```typescript
// Token expira após 7 dias
const token = jwt.sign(payload, JWT_SECRET, {
  expiresIn: '7d',  // ← Expiração
});

// Após 7 dias:
// - jwt.verify() vai falhar
// - Cliente recebe 401 Unauthorized
// - Frontend redireciona para login
// - User faz login novamente
```

---

## 3. Criar Vários Tipos de Users para Teste

### 🧪 Script de Teste Automático

Criei um script que cria 4 tipos de users com diferentes roles e organizações:

```bash
cd backend
npx tsx src/scripts/createTestUsers.ts
```

#### O que o Script Cria:

```
1. OWNER (Proprietário de Clínica)
   Email: joao.owner@test.com
   Password: Owner123456
   Role: owner
   Organization: Test Clinic - Owner
   - Permissões: TODAS
   
2. ADMIN (Administrador)
   Email: maria.admin@test.com
   Password: Admin123456
   Role: admin
   Organization: Test Clinic - Admin
   - Pode convidar/gerir doctors
   - Pode ver todos patients
   - NÃO pode gerir billing
   
3. SOLO PRACTITIONER (Prática Individual)
   Email: pedro.solo@test.com
   Password: Solo123456
   Role: owner
   Organization: Solo Practice
   - Único doctor, é owner
   - Vê apenas os seus patients
   
4. MEMBER (Membro)
   Email: ana.member@test.com
   Password: Member123456
   Role: member
   Organization: Multi-Doctor Clinic
   - Permissões mínimas
   - Vê apenas os seus patients
```

### 📋 Adicionar mais Users Personalizados

Para adicionar mais tipos de users, edita [createTestUsers.ts](c:\Users\mjtom\Code\github\pu\backend\src\scripts\createTestUsers.ts):

```typescript
const testUsers = [
  // ... users existentes ...
  
  // Novo user
  {
    organizationName: 'My Custom Clinic',
    organizationType: 'clinic',
    doctor: {
      firstName: 'Custom',
      lastName: 'Doctor',
      email: 'custom@test.com',
      password: 'Custom123456',
      specialization: 'Pediatric Psychology',
      role: 'admin' as const,  // 'owner' | 'admin' | 'member'
    }
  },
];
```

Depois corre:
```bash
npx tsx src/scripts/createTestUsers.ts
```

### 🧑‍💼 Testes Manuais com cURL

#### Teste 1: Login com OWNER

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.owner@test.com",
    "password": "Owner123456"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "doctor": {
    "_id": "...",
    "firstName": "João",
    "lastName": "Silva (Owner)",
    "email": "joao.owner@test.com",
    "role": "owner",
    "permissions": {
      "canManageOrganization": true,
      "canManageDoctors": true,
      "canViewAllPatients": true,
      "canManageBilling": true
    }
  },
  "organization": {
    "_id": "...",
    "name": "Test Clinic - Owner",
    "type": "clinic"
  }
}
```

#### Teste 2: Usar Token para Aceder a Recurso Protegido

```bash
# Copia o token do response anterior
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Acede a recurso protegido
curl -X GET http://localhost:5000/api/patients \
  -H "Authorization: Bearer $TOKEN"
```

#### Teste 3: Login com MEMBER (Sem Permissões)

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ana.member@test.com",
    "password": "Member123456"
  }'
```

**Response:**
```json
{
  "token": "...",
  "doctor": {
    "_id": "...",
    "firstName": "Ana",
    "lastName": "Oliveira (Member)",
    "email": "ana.member@test.com",
    "role": "member",
    "permissions": {
      "canManageOrganization": false,
      "canManageDoctors": false,
      "canViewAllPatients": false,
      "canManageBilling": false
    }
  }
}
```

---

## 4. Testar no Frontend

### 🖥️ Login Page

1. Vai para http://localhost:5173/login
2. Usa um das credenciais:

| Tipo | Email | Password |
|------|-------|----------|
| Owner | joao.owner@test.com | Owner123456 |
| Admin | maria.admin@test.com | Admin123456 |
| Solo | pedro.solo@test.com | Solo123456 |
| Member | ana.member@test.com | Member123456 |

### 👁️ O que Varia por Role

#### OWNER
```
- Dashboard: Mostra todos os dados
- Patients: Pode criar/editar/deletar
- Doctors: Menu visível - Pode convidar/gerir
- Settings: Pode editar organizção + billing
- Consultas: Acesso total
```

#### ADMIN
```
- Dashboard: Mostra todos os dados
- Patients: Pode criar/editar/deletar
- Doctors: Menu visível - Pode convidar/gerir
- Settings: Pode ver settings (NÃO pode editar)
- Consultas: Acesso total
```

#### MEMBER
```
- Dashboard: Mostra apenas os seus dados
- Patients: Apenas os seus patients
- Doctors: Menu ESCONDIDO
- Settings: Pode ver perfil (NÃO pode editar organização)
- Consultas: Apenas as suas
```

---

## 5. Workflow Completo de Segurança

```
REGISTAR          LOGIN            USA TOKEN
    │                │                │
    ▼                ▼                ▼

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Password:     Password:        Token JWT:             │
│  MyPass123     MyPass123        eyJhbGciOiJI...       │
│  ▼             ▼                ▼                      │
│  HASH          COMPARE          VERIFY com JWT_SECRET  │
│  ▼             ▼                ▼                      │
│  BD:           Bcrypt:          jwt.verify()           │
│  $2a$12$ab...  Match?           Payload válido?        │
│                ✓                ✓                      │
│                │                │                      │
│                └────────────────┘                      │
│                 Gera JWT        Dá acesso             │
│                                                         │
│  🔒 Toda a password guardada é HASH                    │
│  🔐 Toda a autenticação usa JWT_SECRET                 │
│  ⏰ Tokens expiram após 7 dias                          │
│  ✓ Bcrypt com 12 rounds = muito seguro               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📚 Ficheiros Relevantes

| Ficheiro | Função |
|----------|---------|
| `models/Doctor.ts` | Schema + pre-save hash + comparePassword |
| `middleware/auth.ts` | Validação JWT + authenticate middleware |
| `controllers/authController.ts` | Login + generateToken |
| `scripts/createTestUsers.ts` | Criar users de teste |
| `.env` | JWT_SECRET |

---

## 🚀 Próximos Passos

1. **Gera users de teste:**
   ```bash
   cd backend
   npx tsx src/scripts/createTestUsers.ts
   ```

2. **Inicia o backend:**
   ```bash
   npm run dev
   ```

3. **Inicia o frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Testa cada role:**
   - Faz login com cada email
   - Testa as permissões
   - Verifica o que cada role consegue fazer

5. **Monitora console:**
   - Frontend: DevTools (Network tab) - vê os tokens
   - Backend: Vê as validações JWT

---

## ❓ FAQs

### P: Posso alterar o JWT_SECRET depois?
**R:** Não! Todos os tokens existentes ficam inválidos. Users teriam de fazer login novamente.

### P: Posso estender o token de 7 dias?
**R:** Sim! Muda em `generateToken()`:
```typescript
expiresIn: '30d'  // 30 dias
```

### P: E se me esquecer da password?
**R:** Precisas implementar "Forgot Password" (future feature).

### P: Onde fica guardado o token no cliente?
**R:** Em `localStorage` chave `authToken`. Em produção, usa `httpOnly cookies`.

### P: Posso reutilizar um token em múltiplos devices?
**R:** Sim! O token não está ligado a um device específico, apenas ao doctor.

---

Agora tens tudo pronto para testar! 🚀
