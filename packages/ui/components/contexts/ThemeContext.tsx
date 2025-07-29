import React, { createContext, useEffect, useState, useContext, ReactNode } from 'react'
import { LightTheme, DarkTheme } from '../foundations/theming/theme'

type ThemeContextProps = {
  isDarkMode: boolean
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextProps>({
  isDarkMode: false,
  toggleTheme: () => {}
})

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true)
  const lightTheme = LightTheme()
  const darkTheme = DarkTheme()

  type Theme = 'dark' | 'light'
  const [themes, setTheme] = useState<Theme>('dark')

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev)

    const newTheme = isDarkMode ? 'light' : 'dark'
    setTheme(newTheme)
    window.localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('theme')
    if (storedTheme && storedTheme == 'light') {
      setIsDarkMode(false)
    }
  }, [])

  const theme = isDarkMode ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <div>{children}</div>
    </ThemeContext.Provider>
  )
}

export const useThemeContext = () => {
  return useContext(ThemeContext) as ThemeContextProps
}
