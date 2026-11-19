/** Lock the document, leaving native dialog overflow available for reading. */
export function lockPanelScroll(document: Document, window: Window) {
  const { scrollX: x, scrollY: y } = window
  const root = document.documentElement.style
  const body = document.body.style
  const changes: Array<[CSSStyleDeclaration, string, string]> = [
    [root, 'overflow', 'hidden'],
    [body, 'overflow', 'hidden'],
    [body, 'position', 'fixed'],
    [body, 'top', `${-y}px`],
    [body, 'left', `${-x}px`],
    [body, 'width', '100%'],
  ]
  const previous = changes.map(([style, name]) => ({
    style,
    name,
    value: style.getPropertyValue(name),
    priority: style.getPropertyPriority(name),
  }))
  for (const [style, name, value] of changes) style.setProperty(name, value)
  let released = false
  return () => {
    if (released) return
    released = true
    for (const { style, name, value, priority } of previous) {
      if (value) style.setProperty(name, value, priority)
      else style.removeProperty(name)
    }
    // Do not inherit the site's global smooth scrolling preference.
    window.scrollTo({ left: x, top: y, behavior: 'instant' })
  }
}
