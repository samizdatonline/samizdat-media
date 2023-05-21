import Joi from 'joi';

export const channelPutSchema = Joi.object(({

}));

export const findByIdSchema = Joi.object({
  _id: Joi.string().required()
});

export const googleAuthSchema = Joi.object({
  token: Joi.string().required(),
  accountId: Joi.string().allow(null, '')
});

export const getArticlesSchema = Joi.object({
  tags: Joi.allow(Joi.array().items(Joi.string()), Joi.string()).optional(),
  channel: Joi.string().optional()
})

export const bindDomainNameToIpAddressSchema = Joi.object({
  region: Joi.string().required(),
  domainName: Joi.string().domain({
    allowFullyQualified: false,
    allowUnicode: false,
    minDomainSegments: 2,
    maxDomainSegments: 2
  }).required(),
  ipFrom: Joi.string().ip({
    version: 'ipv4',
    cidr: 'forbidden'
  }).required(),
  ipTo: Joi.string().ip({
    version: 'ipv4',
    cidr: 'forbidden'
  }).required(),
});

export const applyValidator = (schema, path) => {
  return (req, res, next) => {
    try {
      const validationRes = schema.validate(req[path]);
      if (validationRes.error) {
        return res.status(400).send({message: validationRes.error.message});
      }
      next();
    } catch (err) {
      res.status(400).send({ message: 'Unknown validation error' });
    }
  }
}
