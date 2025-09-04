// cypress/support/schema.js
// JSON Schema validator for mocked API responses

import Ajv from "ajv";

// Ajv instance with tolerant options
const ajv = new Ajv({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
});

// Public helper: validate against a schema, throw if invalid
export const assertSchema = (data, schema, name = "response") => {
  const validate = ajv.compile(schema);
  const ok = validate(data);
  if (!ok) {
    const details = JSON.stringify(validate.errors, null, 2);
    throw new Error(`Schema validation failed for ${name}:\n${details}`);
  }
};
