import clsx from 'clsx'
import React from 'react'

export function LogoIcon(props: React.ComponentProps<'svg'>) {
  return (
    <svg
      aria-label={`Meridian Supply`}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      className={clsx('h-4 w-4 fill-black dark:fill-white', props.className)}
    >
      {/* Marca "M" angular, estilo streetwear */}
      <path
        d="M2 20.4V3.6c0-.5.4-.9.9-.9h2.6c.5 0 .9.4.9.9v9.9l4.6-6.7c.2-.3.6-.4.9-.4h3c.4 0 .7.2.9.5l4.7 6.9V3.7c0-.5.4-.9.9-.9h2.6c.5 0 .9.4.9.9v16.8c0 .6-.6 1-1.2.8l-2.8-1.1c-.3-.1-.5-.4-.5-.8v-3.6l-3.4-5-3.1 4.5c-.2.3-.6.4-.9.4h-3.1c-.4 0-.7-.2-.9-.5L7.6 13v6.6c0 .5-.4.9-.9.9H4.1c-.5 0-.9-.4-.9-.9v-.2h-1.2z"
        fill="currentColor"
      />
    </svg>
  )
}