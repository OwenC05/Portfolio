
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  
  const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
  if (saved) return saved
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function setTheme(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return
  
  localStorage.setItem('theme', theme)
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// Initialize theme on page load
export function initializeTheme(): void {
  if (typeof window === 'undefined') return
  
  const theme = getTheme()
  setTheme(theme)
}
