export interface PasswordStrength {
  score: 0 | 1 | 2 | 3;
  label: 'Muito fraca' | 'Fraca' | 'Média' | 'Forte';
  checks: {
    minLength: boolean;
    hasLetter: boolean;
    hasNumber: boolean;
  };
}

export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@+/, '').toLowerCase();
}

export function validateUsername(raw: string): { valid: boolean; normalized: string; error?: string } {
  const normalized = normalizeUsername(raw);
  if (normalized.length < 3 || normalized.length > 24) {
    return { valid: false, normalized, error: 'O usuário deve ter entre 3 e 24 caracteres.' };
  }
  if (!/^[a-z0-9_.-]+$/.test(normalized)) {
    return {
      valid: false,
      normalized,
      error: 'Use apenas letras sem acento, números, ponto (.), traço (-) ou underline (_).',
    };
  }
  return { valid: true, normalized };
}

export function validateEmail(raw: string, required: boolean = true): { valid: boolean; normalized: string; error?: string } {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return required
      ? { valid: false, normalized, error: 'Informe um e-mail válido para recuperação de senha.' }
      : { valid: true, normalized };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalized)) {
    return { valid: false, normalized, error: 'Formato de e-mail inválido (ex: nome@dominio.com).' };
  }
  return { valid: true, normalized };
}

export function evaluatePasswordStrength(password: string): PasswordStrength {
  const minLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!password || !minLength) {
    return {
      score: 0,
      label: 'Muito fraca',
      checks: { minLength, hasLetter, hasNumber },
    };
  }

  const passed = [minLength, hasLetter, hasNumber, password.length >= 10 || /[^a-zA-Z0-9]/.test(password)].filter(Boolean).length;
  if (passed <= 2) {
    return { score: 1, label: 'Fraca', checks: { minLength, hasLetter, hasNumber } };
  }
  if (passed === 3) {
    return { score: 2, label: 'Média', checks: { minLength, hasLetter, hasNumber } };
  }
  return { score: 3, label: 'Forte', checks: { minLength, hasLetter, hasNumber } };
}

export function validateLoginForm(identifier: string, password: string): string | null {
  const cleanId = identifier.trim().replace(/^@+/, '');
  if (cleanId.length < 3) {
    return 'Informe seu usuário ou e-mail válido.';
  }
  if (!password || password.length < 3) {
    return 'Informe sua senha para entrar.';
  }
  return null;
}

export function validateRegisterForm(params: {
  displayName: string;
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}): string | null {
  if (params.displayName.trim().length < 2) {
    return 'Informe seu nome ou apelido (mínimo 2 caracteres).';
  }
  const emailCheck = validateEmail(params.email, true);
  if (!emailCheck.valid) {
    return emailCheck.error || 'E-mail inválido.';
  }
  const userCheck = validateUsername(params.username);
  if (!userCheck.valid) {
    return userCheck.error || 'Usuário inválido.';
  }
  if (params.password.length < 6) {
    return 'A senha deve ter no mínimo 6 caracteres.';
  }
  if (params.password !== params.confirmPassword) {
    return 'As senhas não coincidem. Confira a confirmação.';
  }
  return null;
}
