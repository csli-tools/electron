import { JSONSchema7, JSONSchema7TypeName } from 'json-schema'
import { ContractDetails, Query, QueryParameter, contractDetailsActions } from '../store/contractDetails'


export default class ContractHelper {
  constructor() {}
  
  parseSchemas(id: number, schemas: JSONSchema7[], appDispatch: any) {
    let details: ContractDetails = {
      id: id,
      inits: [],
      executes: [],
      queries: []
    }
    schemas.forEach(schema => {
      if (schema.title === "QueryMsg") {
        details.queries = this.parseQuerySchema(schema)
      }
      if (schema.title === "ExecuteMsg") {
        details.executes = this.parseQuerySchema(schema)
      }
    })
    appDispatch(contractDetailsActions.upsert(details))
  }
  
  baseArray(schema: JSONSchema7) {
    return schema.oneOf ?? schema.anyOf ?? undefined
  }
  
  parseQuerySchema(schema: JSONSchema7) {
    let queries: Query[] = []
    const baseArray = this.baseArray(schema)
    if (baseArray) {
      baseArray.forEach(subSchema => {
        if (!subSchema.hasOwnProperty("required")) {
          return
        }
        const typedSchema = subSchema as JSONSchema7
        if (typedSchema.required && typedSchema.properties) {
          typedSchema.required.forEach(required => {
            const queryName = required
            const properties = typedSchema.properties[required]
            if (!properties.hasOwnProperty("properties")) {
              queries.push({
                key: queryName,
                parameters: [],
              })
              return
            }
            const typedProperties = properties as JSONSchema7
            
            let mandatoryKeys = typedProperties.required ?? []
            let optionalKeys = Object.keys(typedProperties.properties).filter(key => !mandatoryKeys.includes(key))
    
            const mandatory: QueryParameter[] = this.parseParametersForKeys(mandatoryKeys, mandatoryKeys, typedProperties, schema)
            const optional: QueryParameter[] = this.parseParametersForKeys(optionalKeys, mandatoryKeys, typedProperties, schema)
            queries.push({
              key: queryName,
              parameters: [...mandatory, ...optional]
            })
          })
        }
      })
    }
    return queries
  }

  parseRefParamater(key: string, required: boolean, typedProperties: JSONSchema7, schema: JSONSchema7, ref: string, nullable: boolean): QueryParameter {
    const refPath = ref.split("#/")
    if (refPath.length !== 2) {
      return null
    }
    const refArray = refPath[1].split("/")
    let referencedNode = schema[refArray.shift()]
    if (!referencedNode) {
      return null
    }
    while (refArray.length) {
      referencedNode = referencedNode[refArray.shift()]
      if (!referencedNode) {
        return null
      }
    }
    if (!referencedNode.hasOwnProperty("type")) {
      return null
    }
    let typedReferenceNode = referencedNode as JSONSchema7
    const valueType = typedReferenceNode.type
    if (Array.isArray(valueType)) {
      console.error("Unsupported paremter format", typedReferenceNode)
      return null
    }
    return {
      key,
      valueType: nullable ? [valueType as any, "null"] : valueType,
      allowedValues: typedReferenceNode.enum,
      required,
      tags: []
    }
  }

  parseParametersForKeys(keys: string[], mandatoryKeys: string[], typedProperties: JSONSchema7, schema: JSONSchema7): QueryParameter[] {
    return keys.map((key) => {
      const parameterDetails = typedProperties.properties[key]
      if (!parameterDetails.hasOwnProperty("type") && !parameterDetails.hasOwnProperty("anyOf")) {
        console.error("Unsupported paremter format", parameterDetails)
        return null
      } else if (parameterDetails.hasOwnProperty("anyOf")) {
        const typedParameterDetails = parameterDetails as JSONSchema7
        let ref: string | undefined = undefined
        var nullable = false
        typedParameterDetails.anyOf.forEach(value => {
          if (value.hasOwnProperty("$ref")) {
            ref = (value as JSONSchema7).$ref
          }
          if (value.hasOwnProperty("type")) {
            nullable = (value as JSONSchema7).type === "null"
          }
        })
        if (ref) {
          return this.parseRefParamater(key, mandatoryKeys.includes(key), typedProperties, schema, ref, nullable)
        }
        console.error("Unsupported paremter format", parameterDetails)
        return null

      }
      const typedParameterDetails = parameterDetails as JSONSchema7
      const valueType = typedParameterDetails.type
      
      const parameterKeys = Object.keys(typedParameterDetails).filter(parameterKey => parameterKey !== "type")
      const tags: string[] = parameterKeys.map(parameterKey => `${parameterKey}: ${typedParameterDetails[parameterKey]}`)
      return {
        key,
        valueType,
        required: mandatoryKeys.includes(key),
        tags
      }
    }).filter(item => item !== null)
  }
  
  mutateQueryParameters(activeQuery: any, queryKey: string, parameter: QueryParameter, key: string, value: string) {
    
    let parsedValue: any = value
    switch (parameter.valueType) {
      case 'number':
        parsedValue = parseFloat(value)
        break
      case 'integer':
        parsedValue = parseInt(value)
        break
      case 'string':
        parsedValue = value
        break
      case 'boolean':
        parsedValue = (value.toLowerCase() === "true" ? true : false)
        break
      default:
        if (Array.isArray(parameter.valueType)) { // this is a naive approach that covers optional values `['number', 'null']` but type arrays are otherwise currently unsupported
          let valueArray = parameter.valueType as Array<JSONSchema7TypeName>
          if (valueArray.length !== 2 || !valueArray.includes("null")) {
            console.error("unsupported value type", parameter.valueType)
            return
          }
          if (valueArray.includes("number")) {
            parsedValue = parseFloat(value)
          } else if (valueArray.includes("integer")) {
            parsedValue = parseInt(value)
          } else if (valueArray.includes("boolean")) {
            parsedValue = (value.toLowerCase() === "true" ? true : false)
          } else if (valueArray.includes("string")) {
            parsedValue = value
          } else {
            console.error("unsupported value type", parameter.valueType)
            return
          }
        } else {
          console.error("unsupported value type", parameter.valueType)
          return
        }
    }
    return {
      ...activeQuery,
      [queryKey]: {
        ...activeQuery[queryKey],
        [key]: parsedValue
      }
    }
  }

}
