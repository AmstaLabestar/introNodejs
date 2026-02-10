/**
 * Middleware de validation des données avec Joi
 * @param {object} schema - Schema Joi à valider
 * @returns {function} Middleware Express
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Erreur de validation',
        details: details
      });
    }

    // Remplacer req.body par les données validées et nettoyées
    req.body = value;
    next();
  };
};

module.exports = validate;
