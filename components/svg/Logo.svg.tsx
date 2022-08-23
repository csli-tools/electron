import React from 'react'

interface LogoProps {
  className?: string
}
const Logo: React.FC<LogoProps> = ({className}) => {
  return <svg className={className} width="385px" height="387px" viewBox="0 0 385 387" version="1.1" xmlns="http://www.w3.org/2000/svg" >
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linejoin="round">
      <g id="Logo" transform="translate(9.000000, 9.500000)" stroke="#CD3400" stroke-width="18">
        <path d="M0,294.5 L0,200.5 C9.64732338e-16,193.872583 5.372583,188.5 12,188.5 L293,188.5 C299.627417,188.5 305,183.127417 305,176.5 L305,12 C305,5.372583 299.627417,-2.99379359e-15 293,0 L134,0 C127.372583,-5.58920087e-16 122,5.372583 122,12 L122,294.5 C122,301.127417 116.627417,306.5 110,306.5 L12,306.5 C5.372583,306.5 8.11624501e-16,301.127417 0,294.5 Z" id="Path-Copy" fill="#0077D5"></path>
        <path d="M62,356.5 L62,262.5 C62,255.872583 67.372583,250.5 74,250.5 L355,250.5 C361.627417,250.5 367,245.127417 367,238.5 L367,74 C367,67.372583 361.627417,62 355,62 L196,62 C189.372583,62 184,67.372583 184,74 L184,356.5 C184,363.127417 178.627417,368.5 172,368.5 L74,368.5 C67.372583,368.5 62,363.127417 62,356.5 Z" id="Path" fill="#D19300"></path>
      </g>
    </g>
  </svg>
}

export default Logo
