import React from 'react'
import { QueryParameter } from '../store/contractDetails'

interface QueryParameterFieldProps {
  parameter: QueryParameter
  onChange?: (key: string, value: string) => void
}

const QueryParameterField: React.FC<QueryParameterFieldProps> = ({ parameter, onChange }) => {
  return (
    <div className="py-2">
      <label className="block flex space-x-2 justify-between items-center" htmlFor={parameter.key}>
        <span className="font-medium text-lg flex-inline items-start">
          <span>{parameter.key}</span>
          {parameter.required &&
            <span className="inline-block text-failure text-sm align-super ml-1">*</span>
          }
        </span>
        
        <span className="inline-flex space-x-1">
          {parameter.tags.map(tag => {
            return <span className="rounded-full bg-seafoam-300 text-xs inline-flex justify-center items-center px-2" key={tag}>{tag}</span>
          })}
        </span>
      </label>
      {!!parameter.allowedValues &&
        <select className="w-full p-2 block border border-gray-300 rounded mt-2" id={parameter.key} onChange={(e) => onChange(parameter.key, e.target.value)}>
          {parameter.allowedValues.map(allowedValue => {
            return (
              <option key={allowedValue} value={allowedValue}>{allowedValue}</option>
            )
          })}
        </select>
      }
      {!parameter.allowedValues &&
        <input className="w-full p-2 block border border-gray-300 rounded mt-2" id={parameter.key} type="text" onChange={(e) => onChange(parameter.key, e.target.value)} />
      }
    </div>
  )
}

export default QueryParameterField
