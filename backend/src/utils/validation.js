import Joi from 'joi';

export const schemas = {
  // Auth
  login: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).max(100).required(),
  }),

  // Siswa
  siswaCreate: Joi.object({
    nis: Joi.string().alphanum().max(20).required(),
    nama: Joi.string().max(100).required(),
    kelas: Joi.string().max(50).required(),
    hp_ortu: Joi.string().pattern(/^[0-9+]{10,15}$/).optional(),
  }),

  siswaUpdate: Joi.object({
    nama: Joi.string().max(100),
    kelas: Joi.string().max(50),
    hp_ortu: Joi.string().pattern(/^[0-9+]{10,15}$/),
  }),

  // Absensi
  absensiManual: Joi.object({
    nis: Joi.string().alphanum().required(),
    status: Joi.string().valid('H', 'S', 'I', 'A').required(),
    keterangan: Joi.string().max(255).optional(),
  }),

  // Guru
  guruCreate: Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(8).max(100).required(),
    nama: Joi.string().max(100).required(),
    role: Joi.string().valid('GURU', 'WALI', 'ADMIN', 'BK').required(),
    kelas_wali: Joi.string().max(50).optional(),
    hp: Joi.string().pattern(/^[0-9+]{10,15}$/).optional(),
  }),
};

export const validate = (data, schema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((d) => `${d.path.join('.')}: ${d.message}`);
    throw new ValidationError(messages.join(', '));
  }

  return value;
};

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}
