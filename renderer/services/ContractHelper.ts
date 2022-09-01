import { CosmWasmClient, isMsgExecuteEncodeObject } from '@cosmjs/cosmwasm-stargate'
import { isMsgSendEncodeObject } from '@cosmjs/stargate'
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx"
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx'
import { toHex, toBase64 } from '@cosmjs/encoding'
import { sha256 } from '@cosmjs/crypto'
import { decodeTxRaw, DecodedTxRaw, decodePubkey } from '@cosmjs/proto-signing'

import { getStore } from '../store'
import { Block, blockActions } from '../store/blocks'
import { JSONSchema7, JSONSchema7TypeName } from 'json-schema'
import { ContractDetails, Query, QueryParameter, contractDetailsSelectors, contractDetailsActions } from '../store/contractDetails'


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
    
            const mandatory: QueryParameter[] = this.parseParametersForKeys(mandatoryKeys, mandatoryKeys, typedProperties)
            const optional: QueryParameter[] = this.parseParametersForKeys(optionalKeys, mandatoryKeys, typedProperties)
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
  
  parseParametersForKeys(keys: string[], mandatoryKeys: string[], typedProperties: JSONSchema7): QueryParameter[] {
    return keys.map((key) => {
      const parameterDetails = typedProperties.properties[key]
      if (!parameterDetails.hasOwnProperty("type")) {
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
