import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Registo de Psicólogo com Organização
router.post('/register-psychologist', async (req: Request, res: Response) => {
  try {
    const { name, email, password, clinicName } = req.body;

    // Validações
    if (!name || !email || !password || !clinicName) {
      return res.status(400).json({ error: 'Campos obrigatórios em falta' });
    }

    // Verificar se email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já registado' });
    }

    // Criar utilizador
    const user = new User({
      name,
      email,
      password,
      globalRole: 'psychologist',
    });
    await user.save();

    // Criar slug único
    const slug = clinicName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    let uniqueSlug = slug;
    let counter = 1;
    while (await Organization.findOne({ slug: uniqueSlug })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    // Criar organização
    const organization = new Organization({
      name: clinicName,
      slug: uniqueSlug,
      owner: user._id,
      subscription: {
        plan: 'free',
        status: 'active',
        startDate: new Date(),
      },
    });
    await organization.save();

    // Adicionar utilizador à organização
    user.organizations.push({
      organizationId: organization._id,
      role: 'owner',
    });
    await user.save();

    // Gerar token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '24h',
    });

    res.status(201).json({
      message: 'Clínica criada com sucesso',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      organization: {
        id: organization._id,
        name: organization.name,
        slug: organization.slug,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password obrigatórios' });
    }

    const user = await User.findOne({ email }).select('+password').populate('organizations.organizationId');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', {
      expiresIn: '24h',
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        globalRole: user.globalRole,
        organizations: user.organizations.map((org: any) => ({
          id: org.organizationId._id,
          name: org.organizationId.name,
          slug: org.organizationId.slug,
          role: org.role,
        })),
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Obter perfil do utilizador autenticado
router.get('/profile', authenticate, async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).populate('organizations.organizationId');
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;