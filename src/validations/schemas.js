const Joi = require('joi');

const schemas = {
  // User Registration
  register: Joi.object({
    username: Joi.string()
      .trim()
      .pattern(/^[a-zA-Z0-9_]+$/)
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.pattern.base': 'Le pseudonyme doit contenir uniquement des lettres, chiffres et underscore',
        'string.min': 'Le pseudonyme doit contenir au minimum 3 caractères',
        'string.max': 'Le pseudonyme doit contenir au maximum 30 caractères',
        'any.required': 'Le pseudonyme est obligatoire'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Veuillez entrer une adresse email valide',
        'any.required': 'L\'email est obligatoire'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au minimum 6 caractères',
        'any.required': 'Le mot de passe est obligatoire'
      }),
    confirmPassword: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Les mots de passe ne correspondent pas',
        'any.required': 'Veuillez confirmer votre mot de passe'
      })
  }),

  // User Login
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Veuillez entrer une adresse email valide',
        'any.required': 'L\'email est obligatoire'
      }),
    password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Le mot de passe doit contenir au minimum 6 caractères',
        'any.required': 'Le mot de passe est obligatoire'
      })
  }),

  // Update User
  updateUser: Joi.object({
    username: Joi.string()
      .trim()
      .pattern(/^[a-zA-Z0-9_]+$/)
      .min(3)
      .max(30)
      .optional()
      .messages({
        'string.pattern.base': 'Le pseudonyme doit contenir uniquement des lettres, chiffres et underscore',
        'string.min': 'Le pseudonyme doit contenir au minimum 3 caractères',
        'string.max': 'Le pseudonyme doit contenir au maximum 30 caractères'
      }),
    email: Joi.string()
      .email()
      .optional()
      .messages({
        'string.email': 'Veuillez entrer une adresse email valide'
      })
  }).or('username', 'email'),

  // Create Post
  createPost: Joi.object({
    content: Joi.string()
      .max(5000)
      .optional()
      .messages({
        'string.max': 'Le contenu doit contenir au maximum 5000 caractères'
      }),
    title: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Le titre doit contenir au maximum 200 caractères'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'La description doit contenir au maximum 500 caractères'
      })
  }),

  // Update Post
  updatePost: Joi.object({
    content: Joi.string()
      .max(5000)
      .optional()
      .messages({
        'string.max': 'Le contenu doit contenir au maximum 5000 caractères'
      }),
    title: Joi.string()
      .max(200)
      .optional()
      .messages({
        'string.max': 'Le titre doit contenir au maximum 200 caractères'
      }),
    description: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'La description doit contenir au maximum 500 caractères'
      })
  }),

  // Create Comment
  createComment: Joi.object({
    content: Joi.string()
      .min(2)
      .max(500)
      .required()
      .trim()
      .messages({
        'string.min': 'Le commentaire doit contenir au minimum 2 caractères',
        'string.max': 'Le commentaire doit contenir au maximum 500 caractères',
        'any.required': 'Le contenu du commentaire est obligatoire'
      }),
    post: Joi.string()
      .required()
      .messages({
        'any.required': 'L\'ID du post est obligatoire'
      })
  }),

  // Update Comment
  updateComment: Joi.object({
    content: Joi.string()
      .min(2)
      .max(500)
      .required()
      .trim()
      .messages({
        'string.min': 'Le commentaire doit contenir au minimum 2 caractères',
        'string.max': 'Le commentaire doit contenir au maximum 500 caractères',
        'any.required': 'Le contenu du commentaire est obligatoire'
      })
  }),

  // Send Message
  sendMessage: Joi.object({
    content: Joi.string()
      .min(1)
      .max(5000)
      .required()
      .trim()
      .messages({
        'string.min': 'Le message ne peut pas être vide',
        'string.max': 'Le message doit contenir au maximum 5000 caractères',
        'any.required': 'Le contenu du message est obligatoire'
      }),
    recipientId: Joi.string()
      .required()
      .messages({
        'any.required': 'L\'ID du destinataire est obligatoire'
      })
  })
};

module.exports = schemas;
