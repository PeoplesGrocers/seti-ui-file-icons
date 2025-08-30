import { useMemo, useState } from 'react'
import { themeIcons as themeOriginalIcons } from 'seti-icons'
import { themeIcons as themeUpdatedIcons, definitions } from '@peoplesgrocers/seti-icons'
import './App.css'

// Generate example filenames from definitions at runtime
const generateExampleFiles = () => {
  const examples = new Set<string>()

  // Add extension examples
  Object.keys(definitions.extensions).forEach(ext => {
    examples.add(`example${ext}`)
  })

  // Add specific file examples
  Object.keys(definitions.files).forEach(file => {
    examples.add(file)
  })

  // Add partial examples
  definitions.partials.forEach(([partial]: [string, unknown]) => {
    // For partials that already have extensions, use as-is
    if (partial.includes('.')) {
      examples.add(partial)
    } else {
      // For partials without extensions, add a common extension
      examples.add(`${partial}.txt`)
    }
  })

  // Add some common extension examples that might not be in definitions
  const commonExtensions = ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rs', '.php', '.rb']
  commonExtensions.forEach(ext => {
    examples.add(`example${ext}`)
  })

  return Array.from(examples).sort()
}

const allSampleFiles = generateExampleFiles()

// Color themes for light and dark modes
const lightColorTheme = {
  blue: '#268bd2',
  grey: '#6b7280',
  'grey-light': '#9ca3af',
  green: '#059669',
  orange: '#d97706',
  pink: '#db2777',
  purple: '#7c3aed',
  red: '#dc2626',
  white: '#374151',
  yellow: '#eab308',
  ignore: '#9ca3af',
}

const darkColorTheme = {
  blue: '#268bd2',
  grey: '#657b83',
  'grey-light': '#839496',
  green: '#859900',
  orange: '#cb4b16',
  pink: '#d33682',
  purple: '#6c71c4',
  red: '#dc322f',
  white: '#fdf6e3',
  yellow: '#b58900',
  ignore: '#586e75',
}

interface ThemedIcon {
  svg: string
  color: string
}

function IconDisplay({
  filename,
  original,
  updated
}: {
  filename: string
  original: ThemedIcon | null
  updated: ThemedIcon | null
}) {
  const isDifferent = original?.svg !== updated?.svg || original?.color !== updated?.color

  return (
    <div className={`icon-item ${isDifferent ? 'different' : 'same'}`}>
      <h4 className="filename">{filename}</h4>
      <div className="icon-comparison">
        <div className="icon-version">
          <h5>Original (seti-icons)</h5>
          {original?.svg ? (
            <div className="icon-container">
              <div
                className="icon-svg"
                dangerouslySetInnerHTML={{ __html: original.svg }}
                style={{ color: original.color }}
              />
              <span className="color-name">{original.color}</span>
            </div>
          ) : (
            <div className="no-icon">No icon</div>
          )}
        </div>
        <div className="icon-version">
          <h5>Updated (@peoplesgrocers/seti-icons)</h5>
          {updated?.svg ? (
            <div className="icon-container">
              <div
                className="icon-svg"
                dangerouslySetInnerHTML={{ __html: updated.svg }}
                style={{ color: updated.color }}
              />
              <span className="color-name">{updated.color}</span>
            </div>
          ) : (
            <div className="no-icon">No icon</div>
          )}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [filter, setFilter] = useState<'all' | 'different'>('all')
  const [darkMode, setDarkMode] = useState(false)
  const [showUniqueOnly, setShowUniqueOnly] = useState(true)

  // Select color theme based on dark mode
  const colorTheme = useMemo(() => darkMode ? darkColorTheme : lightColorTheme, [darkMode])

  // Create themed icon functions with current theme
  const getThemedOriginal = useMemo(() => themeOriginalIcons(colorTheme), [colorTheme])
  const getThemedUpdated = useMemo(() => themeUpdatedIcons(colorTheme), [colorTheme])

  const iconComparisons = useMemo(() => {
    const allComparisons = allSampleFiles.map(filename => {
      let original: ThemedIcon | null = null
      let updated: ThemedIcon | null = null

      try {
        original = getThemedOriginal(filename)
      } catch {
        // Keep original as null
      }

      try {
        updated = getThemedUpdated(filename)
      } catch {
        // Keep updated as null
      }

      return { filename, original, updated }
    })

    if (!showUniqueOnly) {
      return allComparisons
    }

    // Filter for unique icons only
    const seenIcons = new Map<string, { filename: string, original: ThemedIcon | null, updated: ThemedIcon | null }>()
    
    allComparisons.forEach(comparison => {
      const { filename, original, updated } = comparison
      // Create a unique key for this icon combination
      const iconKey = `${original?.svg || 'null'}-${original?.color || 'null'}-${updated?.svg || 'null'}-${updated?.color || 'null'}`
      
      // Only keep the first filename for each unique icon combination
      if (!seenIcons.has(iconKey)) {
        seenIcons.set(iconKey, comparison)
      }
    })

    return Array.from(seenIcons.values()).sort((a, b) => a.filename.localeCompare(b.filename))
  }, [showUniqueOnly, getThemedOriginal, getThemedUpdated])

  const differentCount = iconComparisons.filter(({ original, updated }) => 
    original?.svg !== updated?.svg || original?.color !== updated?.color
  ).length

  const totalCount = iconComparisons.length
  const sameCount = totalCount - differentCount

  const filteredComparisons = useMemo(() => {
    if (filter === 'different') {
      return iconComparisons.filter(({ original, updated }) => 
        original?.svg !== updated?.svg || original?.color !== updated?.color
      )
    }
    return iconComparisons
  }, [iconComparisons, filter])

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <header>
        <div className="header-top">
          <h1>Seti Icons Comparison</h1>
          <div className="theme-tabs">
            <div className="tabs-list">
              <button
                className={`tabs-trigger ${!darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(false)}
                data-state={!darkMode ? 'active' : 'inactive'}
              >
                <span className="tab-icon">☀️</span>
                <span className="tab-label">Light</span>
              </button>
              <button
                className={`tabs-trigger ${darkMode ? 'active' : ''}`}
                onClick={() => setDarkMode(true)}
                data-state={darkMode ? 'active' : 'inactive'}
              >
                <span className="tab-icon">🌙</span>
                <span className="tab-label">Dark</span>
              </button>
            </div>
          </div>
        </div>
        <p>Comparing original seti-icons package vs updated @peoplesgrocers/seti-icons</p>
        
        <div className="controls">
          <div className="left-controls">
            <div className="filter-controls">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All ({totalCount})
              </button>
              <button 
                className={`filter-btn ${filter === 'different' ? 'active' : ''}`}
                onClick={() => setFilter('different')}
              >
                Different ({differentCount})
              </button>
            </div>
            <div className="unique-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showUniqueOnly}
                  onChange={(e) => setShowUniqueOnly(e.target.checked)}
                  className="toggle-checkbox"
                />
                <span className="toggle-text">Show unique icons only</span>
              </label>
            </div>
          </div>
          <div className="stats">
            <span className="stat same">Same: {sameCount}</span>
          </div>
        </div>
      </header>
      
      <div className="icons-grid-compact">
        <div className="grid-header">
          <div className="filename-header">File</div>
          <div className="original-header">Original</div>
          <div className="updated-header">Updated</div>
        </div>
        {filteredComparisons.map(({ filename, original, updated }) => {
          const isDifferent = original?.svg !== updated?.svg || original?.color !== updated?.color
          return (
            <div key={filename} className={`grid-row ${isDifferent ? 'different' : 'same'}`}>
              <div className="filename-cell">{filename}</div>
              <div className="icon-cell">
                {original?.svg ? (
                  <div className="icon-display">
                    <div 
                      className="icon-svg-compact"
                      dangerouslySetInnerHTML={{ __html: original.svg }}
                      style={{ color: original.color }}
                    />
                    <span className="color-compact">{original.color}</span>
                  </div>
                ) : (
                  <div className="no-icon-compact">—</div>
                )}
              </div>
              <div className="icon-cell">
                {updated?.svg ? (
                  <div className="icon-display">
                    <div 
                      className="icon-svg-compact"
                      dangerouslySetInnerHTML={{ __html: updated.svg }}
                      style={{ color: updated.color }}
                    />
                    <span className="color-compact">{updated.color}</span>
                  </div>
                ) : (
                  <div className="no-icon-compact">—</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App
