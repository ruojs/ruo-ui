const _ = require('lodash')

function parseSecurityDefinitions (securityDefinitions) {
  // handle multiple apiKey authentication
  let definitions = []
  let handlers = {}
  for (let name in securityDefinitions) {
    const def = securityDefinitions[name]
    const handler = def['x-securityHandler']
    if (def.type !== 'apiKey') {
      definitions.push(def)
      continue
    }

    if (def.type === 'apiKey' && !handlers[handler]) {
      handlers[handler] = true
      definitions.push(def)
    }
  }
  return definitions
}

function schemaToJson (schema) {
  if (schema.example !== undefined) {
    return schema.example
  }

  let json
  switch (schema.type) {
    case 'array':
      json = []
      if (schema.items) {
        json.push(schemaToJson(schema.items))
      }
      break
    case 'number':
      json = 4.2
      break
    case 'integer':
      json = 42
      break
    case 'string':
      json = schema.enum ? schema.enum[0] : 'stringValue'
      break
    case 'boolean':
      json = true
      break
    case 'object':
    default:
      // when support more than one type just show the first one
      if (Array.isArray(schema.type) && schema.type.length) {
        json = schemaToJson({type: schema.type[0]});
      } else {
        json = {}
        if (schema.properties) {
          Object.keys(schema.properties).forEach((key) => {
            json[key] = schemaToJson(schema.properties[key])
          })
        }
      }
      break
  }
  return json
}

function fieldsToJson (fields) {
  let json = {}
  fields.forEach((field) => {
    json[field.name] = schemaToJson(field)
  })
  return json
}

module.exports = {
  parseSecurityDefinitions,
  schemaToJson,
  fieldsToJson
}
