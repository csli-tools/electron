import React, { useMemo, useEffect, RefObject, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Dialog, Transition } from '@headlessui/react'

interface ModalProps {
  title?: string
  description?: string
  isShown: boolean
  setIsShown: (value: boolean) => void
  cancel?: string
  confirm?: string
  classesToAdd?: string[]
  autoFocusRef?: RefObject<any>
  canCommit?: boolean
  onCommit?: () => void
  onDismiss?: () => void
  children?: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({title, description, isShown, cancel, confirm, classesToAdd, autoFocusRef, canCommit, onCommit, onDismiss, children, setIsShown}) => {
  
  const classes = !!classesToAdd ? classesToAdd : []
  classes.push('modal')
  
  const container: HTMLDivElement = useMemo(() => {
    return document.createElement('div')
  }, [])

  // handle esc
  useEffect(() => {
    
  }, [])

  useEffect(() => {
    const elementId = document.getElementById("modal-root") as Element
    elementId.appendChild(container)
    return function cleanup() {
      elementId.removeChild(container)
    }
  }, [container])

  useEffect(() => {
    if (isShown && autoFocusRef && autoFocusRef.current) {
      autoFocusRef.current.focus()
    }
  }, [isShown, autoFocusRef])
  
  const commit = useCallback(() => {
    if (canCommit === undefined || canCommit == true) {
      if (onCommit) {
        onCommit()
      }
      if (onDismiss) {
        onDismiss()
      }
    }
  }, [canCommit, onCommit, onDismiss])

  const close = useCallback(() => {
    setIsShown(false)
    if (onDismiss) {
      onDismiss()
    }
  }, [onDismiss])
  
  return ReactDOM.createPortal((
    <div className={classes.join(' ')} onClick={(e) => e.stopPropagation()}>
      <Transition.Root show={isShown} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={close}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
      
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-xl sm:p-6">
                  <div>
                    <div className="mt-3 text-center sm:mt-5">
                      {title &&
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                          {title}
                        </Dialog.Title>
                      }
                      {description &&
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            {description}
                          </p>
                        </div>
                      }
                      {children}
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6 flex space-x-2">
                    {cancel &&
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-gray-300 px-4 py-2 text-base font-medium text-black shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:text-sm"
                        onClick={close}
                      >
                        {cancel}
                      </button>
                    }
                    {confirm &&
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md border border-transparent bg-seafoam-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-seafoam-700 focus:outline-none focus:ring-2 focus:ring-seafoam-500 focus:ring-offset-2 sm:text-sm"
                        onClick={() => commit()}
                      >
                        {confirm}
                      </button>
                    }
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  ), container)
}

export default Modal
