import React, { useEffect, useState } from 'react'
import { ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'

import Wasm from '../services/Wasm'
import { useAppSelector, useAppDispatch } from '../store/'
import { Contract, ContractInstance, contractSelectors, contractActions } from '../store/contracts'
import { default as ContractInstanceElement } from './Contract'
import styles from '../styles/Subpanel.module.css'
import classNames from '../utils/classNames'

const Keys: React.FC = () => {
  

  return (
    <div className="relative">
      
    </div>
  )
}

export default Keys
