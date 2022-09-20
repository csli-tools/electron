import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { JSONSchema7 } from 'json-schema'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json'
import bash from 'react-syntax-highlighter/dist/cjs/languages/hljs/bash'
import javascript from 'react-syntax-highlighter/dist/cjs/languages/hljs/javascript'
import docco from 'react-syntax-highlighter/dist/cjs/styles/hljs/docco'
import { Coin, StdFee } from "@cosmjs/stargate";

SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('javascript', javascript);

import Wasm from '../services/Wasm'
import { useAppSelector, useAppDispatch } from '../store/'
import { ContractInstance } from '../store/contracts'
import { keySelectors } from '../store/keys'
import { Query, QueryParameter, contractDetailsSelectors } from '../store/contractDetails'
import QueryParameterField from './QueryParameterField'
import ContractHelper from '../services/ContractHelper'

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

interface ContractProps {
  instance: ContractInstance
}

enum ContractMessageType {
  Init,
  Execute,
  Query
}

enum SnippetLanguage {
  Javascript,
  CommandLine
}

const Contract: React.FC<ContractProps> = ({ instance }) => {
  const [selectedMessageType, setSelectedMessageType] = useState<ContractMessageType>(ContractMessageType.Query)
  const [selectedQuery, setSelectedQuery] = useState<Query | undefined>(undefined)
  const [activeQuery, setActiveQuery] = useState<any | undefined>(undefined)
  const [snippetLanguage, setSnippetLanguage] = useState<SnippetLanguage>(SnippetLanguage.Javascript)
  const [contractState, setContractState] = useState<any | undefined>(undefined)
  const [signer, setSigner] = useState<string | undefined>(undefined)
  const [memo, setMemo] = useState<string | undefined>(undefined)
  const [gas, setGas] = useState<string | undefined>(undefined)
  const [funds, setFunds] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  
  const contractDetails = useAppSelector((state) => contractDetailsSelectors.selectById(state, instance.id))
  const appDispatch = useAppDispatch()
  
  const keys = useAppSelector((state) => keySelectors.selectAll(state))
  
  // if we've switched instances to an instance that doesn't have any of the currently selected contract message types, try to switch to a type it does have
  useEffect(() => {
    if (!contractDetails) {
      return
    }
    if (contractDetails.queries.length === 0 && contractDetails.executes.length === 0 && contractDetails.inits.length === 0) {
      return
    }
    if (contractDetails.queries.length === 0 && selectedMessageType === ContractMessageType.Query) {
      contractDetails.executes.length === 0 ? setSelectedMessageType(ContractMessageType.Init) : setSelectedMessageType(ContractMessageType.Execute)
    }
    if (contractDetails.executes.length === 0 && selectedMessageType === ContractMessageType.Execute) {
      contractDetails.queries.length === 0 ? setSelectedMessageType(ContractMessageType.Init) : setSelectedMessageType(ContractMessageType.Query)
    }
    if (contractDetails.inits.length === 0 && selectedMessageType === ContractMessageType.Init) {
      contractDetails.queries.length === 0 ? setSelectedMessageType(ContractMessageType.Execute) : setSelectedMessageType(ContractMessageType.Query)
    }
    if (contractDetails.queries.length > 0 && selectedQuery === undefined) {
      setSelectedQuery(contractDetails.queries[0])
    }
  }, [contractDetails, selectedMessageType, selectedQuery])
  
  useEffect(() => {
    if (!contractDetails) {
      return
    }
    if (contractDetails.queries.length > 0) {
      setSelectedQuery(contractDetails.queries[0])
      return
    }
    if (contractDetails.executes.length > 0) {
      setSelectedQuery(contractDetails.executes[0])
      return
    }
    if (contractDetails.inits.length > 0) {
      setSelectedQuery(contractDetails.inits[0])
      return
    }
  }, [contractDetails])
  
  useEffect(() => {
    if (!selectedQuery) {
      setActiveQuery(undefined)
      return
    }
    setActiveQuery({[selectedQuery.key]: {}})
    setContractState(undefined)
  }, [selectedQuery])

  const parseSchemas = useCallback((schemas: JSONSchema7[]) => {
    const helper = new ContractHelper()
    helper.parseSchemas(instance.id, schemas, appDispatch)
  }, [instance])

  
  const readUploadedFile = (file: File) => {
    const reader = new FileReader();
  
    return new Promise<string>((resolve, reject) => {
      reader.onerror = () => {
        reader.abort();
        reject(new DOMException("Problem parsing input file."));
      };
  
      reader.onload = () => {
        resolve(reader.result as string)
      };
      reader.readAsText(file);
    });
  }
  
  const uploadSchemas = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement
    const schemaPromises = Object.values(target.files).map(async file => {
      const text = await readUploadedFile(file)
      const json = JSON.parse(text)
      return json
    })
    Promise.all(schemaPromises).then(schemas => parseSchemas(schemas))
  }
  
  const tabs = useMemo(() => {
    if (!contractDetails) {
      return []
    }
    let tabs: {name: string, current: boolean, type: ContractMessageType}[] = []
    if (contractDetails.inits.length > 0) {
      tabs.push({
        name: "Init",
        current: selectedMessageType === ContractMessageType.Init,
        type: ContractMessageType.Init
      })
    }
    
    if (contractDetails.queries.length > 0) {
      tabs.push({
        name: "Query State",
        current: selectedMessageType === ContractMessageType.Query,
        type: ContractMessageType.Query
      })
    }
    
    if (contractDetails.executes.length > 0) {
      tabs.push({
        name: "Execute",
        current: selectedMessageType === ContractMessageType.Execute,
        type: ContractMessageType.Execute
      })
    }

    return tabs
  }, [selectedMessageType, contractDetails])
  
  const sendQuery = useCallback(() => {
    try {
      Wasm.sharedInstance().client!.queryContractSmart(instance.address, activeQuery).then(async state => {
        setContractState(state)
        setLoading(false)
      }).catch((error) => {
        setContractState(error.message)
        setLoading(false)
      })
    } catch (error) {
      setContractState(error)
      setLoading(false)
    }
  }, [instance, activeQuery])
  
  const sendExecute = useCallback(() => {
    if (!signer || !gas) {
      setLoading(false)
      return
    }    
    try {
      Wasm.sharedInstance().signingClient(signer).then(async signingClient => {
        const key = keys.filter(key => key.name === signer)[0]
        const cash: Coin[] = [{amount: funds || "0", denom: "stake"}]
        const fee: StdFee = {
          amount: cash,
          gas
        }
        const result = await signingClient.execute(key.address, instance.address, activeQuery, fee, memo, funds ? cash : undefined)
        setContractState(result)
        setLoading(false)
      }).catch((error) => {
        setContractState(error.message)
        setLoading(false)
      })
    } catch (error) {
      setContractState(error)
      setLoading(false)
    }
  }, [instance, activeQuery, signer, gas, funds, memo, keys])
  
  const send = useCallback(() => {
    setLoading(true)
    if (selectedMessageType === ContractMessageType.Query) {
      sendQuery()
    } else {
      sendExecute()
    }

  }, [selectedMessageType, sendQuery, sendExecute])
  
  const updateActiveQueryParam = useCallback((parameter: QueryParameter, key: string, value: string) => {
    const helper = new ContractHelper()
    
    setActiveQuery(helper.mutateQueryParameters(activeQuery, selectedQuery.key, parameter, key, value))
  }, [activeQuery, selectedQuery])
  
  const snippet: string = useMemo(() => {
    if (selectedMessageType === ContractMessageType.Query) {
      if (snippetLanguage === SnippetLanguage.Javascript) {
        return `const query = (client: CosmWasmClient) => {\n\tclient.queryContractSmart(\n\t\t"${instance.address}",\n\t\t${JSON.stringify(activeQuery)}\n\t).then(state => {\n\t\tconsole.log(state)\n\t})\n}`
      } else {
        return `wasmd query wasm contract-state smart \\\n${instance.address} \\\n'${JSON.stringify(activeQuery)}'`
      }
    } else {
      if (!signer || !gas) {
        return ""
      }
      const key = keys.filter(key => key.name === signer)[0]

      if (snippetLanguage === SnippetLanguage.Javascript) {
        return `const query = (client: SigningCosmWasmClient, gas: StdFee, memo?: string, funds?: Coin[]) => {\n\tclient.execute(\n\t\t"${key.address}"\n\t\t"${instance.address}",\n\t\t${JSON.stringify(activeQuery)}\n\t\tgas,\n\t\tmemo,\n\t\tfunds\n\t).then(result => {\n\t\tconsole.log(result)\n\t})\n}`
      } else {
        return `wasmd tx wasm execute ${instance.address} \\\n'${JSON.stringify(activeQuery)}' \\\n--from ${signer} \\\n--gas ${gas} \\\n--chain-id your-chain`
      }
    }
  }, [snippetLanguage, activeQuery, instance, selectedMessageType, signer, gas, funds, memo, keys])
  
  const queriesArray = useMemo(() => {
    if (!contractDetails) {
      return []
    }
    switch (selectedMessageType) {
      case ContractMessageType.Query:
        return contractDetails.queries
        break
      case ContractMessageType.Execute:
        return contractDetails.executes
        break
      case ContractMessageType.Init:
        return contractDetails.inits
        break
    }
  }, [contractDetails, selectedMessageType])
  
  const selectDefaultQuery = useCallback((messageType: ContractMessageType) => {
    if (!contractDetails) {
      return []
    }
    let queriesArray
    switch (messageType) {
      case ContractMessageType.Query:
        queriesArray = contractDetails.queries
        break
      case ContractMessageType.Execute:
        queriesArray = contractDetails.executes
        break
      case ContractMessageType.Init:
        queriesArray = contractDetails.inits
        break
    }

    if (queriesArray.length) {
      setSelectedQuery(queriesArray[0])
    }
  }, [])
  
  return (
    <div className="p-8 h-screen overflow-y-scroll">
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-semibold text-gray-900">Contract Details</h1>
          {contractDetails &&
            <div>
              <label htmlFor="replace-schemas" className='bg-seafoam-500 text-white rounded p-2 text-xs cursor-pointer' >Replace Schemas</label>
              <input id="replace-schemas" className="hidden" type="file" multiple onChange={(e) => uploadSchemas(e)} />
            </div>
          }
        </div>
        {!contractDetails &&
          <div className="flex flex-col h-full w-full space-y-8">
            <p>This smart contract isn’t configured yet. Attach your contract’s schema files to continue.</p>
            <input className="rounded border p-2" type="file" multiple onChange={(e) => uploadSchemas(e)} />
          </div>
        }
        {contractDetails &&
          <div>
            <nav className="isolate flex divide-x divide-gray-200 rounded-lg shadow my-4" aria-label="Tabs">
              {tabs.length > 1 && tabs.map((tab, index) => (
                <a
                  key={tab.name}
                  href="#"
                  onClick={() => {
                    setSelectedMessageType(tab.type)
                    selectDefaultQuery(tab.type)
                  }}
                  className={classNames(
                    tab.current ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                    index === 0 ? 'rounded-l-lg' : '',
                    index === tabs.length - 1 ? 'rounded-r-lg' : '',
                    'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
                  )}
                  aria-current={tab.current ? 'page' : undefined}
                >
                  <span>{tab.name}</span>
                  <span
                    aria-hidden="true"
                    className={classNames(
                      tab.current ? 'bg-seafoam-500' : 'bg-transparent',
                      'absolute inset-x-0 bottom-0 h-0.5'
                    )}
                  />
                </a>
              ))}
            </nav>
            <div>
              <div className="flex space-x-2 items-center">
                <span>Select a message:</span>
                <select className="rounded border border-seafoam-500 cursor-pointer" defaultValue={selectedQuery?.key} onChange={(e) => setSelectedQuery(queriesArray.find(query => query.key === e.target.value))}>
                  {queriesArray.map(query => {
                    return <option key={query.key} value={query.key}>{query.key}</option>
                  })}
                </select>
              </div>
              { selectedQuery &&
                <React.Fragment>
                  {selectedMessageType === ContractMessageType.Execute &&
                    <React.Fragment>
                      <h2 className="bold text-xl mt-8 mb-4">Signing:</h2>
                      <div className="grid grid-cols-2 gap-4 bg-seafoam-100 px-4 rounded mb-4">
                        <div className="py-2">
                          <label className="block flex space-x-2 justify-between items-center" htmlFor="signer">
                            <span className="font-medium text-lg flex-inline items-start">
                              <span>Signer</span>
                              <span className="inline-block text-failure text-sm align-super ml-1">*</span>
                            </span>
                          </label>
                            <select className="w-full p-2 block border border-gray-300 rounded mt-2" id="signer" onChange={(e) => setSigner(e.target.value)}>
                              {keys.map(key => {
                                return (
                                  <option key={key.name} value={key.name}>{key.name}</option>
                                )
                              })}
                            </select>
                        </div>
                        <div className="py-2">
                          <label className="block flex space-x-2 justify-between items-center" htmlFor="gas">
                            <span className="font-medium text-lg flex-inline items-start">
                              <span>Gas</span>
                              <span className="inline-block text-failure text-sm align-super ml-1">*</span>
                            </span>
                          </label>
                            <input className="w-full p-2 block border border-gray-300 rounded mt-2" id="gas" type="text" onChange={(e) => setGas(e.target.value)} />
                        </div>
                        <div className="py-2">
                          <label className="block flex space-x-2 justify-between items-center" htmlFor="funds">
                            <span className="font-medium text-lg flex-inline items-start">
                              <span>Funds</span>
                            </span>
                          </label>
                            <input className="w-full p-2 block border border-gray-300 rounded mt-2" id="funds" type="text" onChange={(e) => setFunds(e.target.value)} />
                        </div>
                        <div className="py-2">
                          <label className="block flex space-x-2 justify-between items-center" htmlFor="memo">
                            <span className="font-medium text-lg flex-inline items-start">
                              <span>Memo</span>
                            </span>
                          </label>
                            <input className="w-full p-2 block border border-gray-300 rounded mt-2" id="memo" type="text" onChange={(e) => setMemo(e.target.value)} />
                        </div>
                      </div>
                      <h2 className="bold text-xl mt-8 mb-4">Contract Paramaters:</h2>
                    </React.Fragment>
                  }
                  {selectedMessageType !== ContractMessageType.Execute &&
                    <div className="mt-8" />
                  }
                  {selectedQuery.parameters.length > 0 && 
                    <div>
                      {/* <h2 className="bold text-xl">Mandatory Parameters:</h2> */}
                      <div className="grid grid-cols-2 gap-4 bg-seafoam-100 px-4 rounded mb-4">
                        {selectedQuery.parameters.map(parameter => {
                          return <QueryParameterField key={parameter.key} parameter={parameter} onChange={(key, value) => updateActiveQueryParam(parameter, key, value)} />
                        })}
                      </div>
                    </div>
                  }
                  <div className="flex justify-end">
                    <button className="rounded bg-seafoam-500 text-white px-4 py-1" onClick={() => send()}>{loading ? "Loading…" : "Send"}</button>
                  </div>
                  {
                    <div className="mt-8">
                      <div className="flex justify-between items-baseline">
                        <h2 className="bold text-xl mb-4">Sample Code:</h2>
                        <div className="flex space-x-4 items-center">
                          <button className={classNames(snippetLanguage === SnippetLanguage.Javascript ? "border-seafoam-500" : "border-transparent", "border-b-4 text-sm")} onClick={() => setSnippetLanguage(SnippetLanguage.Javascript)}>TypeScript</button>
                          <button  className={classNames(snippetLanguage === SnippetLanguage.CommandLine ? "border-seafoam-500" : "border-transparent", "border-b-4 text-sm")} onClick={() => setSnippetLanguage(SnippetLanguage.CommandLine)}>Wasmd</button>
                        </div>
                      </div>
                      <SyntaxHighlighter language={snippetLanguage === SnippetLanguage.Javascript ? "javascript" : "bash"} style={docco} customStyle={{borderRadius: "0.25rem", background: "#D3FDF9"}}>
                        {snippet}
                      </SyntaxHighlighter>
                    </div>
                  }
                  {contractState && 
                    <div className="mt-8">
                      <h2 className="bold text-xl mb-4">Contract Response:</h2>
                      <SyntaxHighlighter language="json" style={docco} customStyle={{borderRadius: "0.25rem", background: "#D3FDF9"}}>
                        {JSON.stringify(contractState, null, 2)}
                      </SyntaxHighlighter>
                    </div>
                  }
                </React.Fragment>
              }
            </div>
          </div>
        }
      </div>
    </div>
  )
}

export default Contract
