import { useMemo } from 'react'
import { themeIcons as themeOriginalIcons } from 'seti-icons'
import { themeIcons as themeUpdatedIcons } from '@peoplesgrocers/seti-icons'
import './App.css'

// Sample file names to demonstrate all icon types
const sampleFiles = [
  // Extensions
  '.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rs', '.php', '.rb', '.c', '.cpp', '.h', '.css', '.scss', '.html', '.xml', '.json', '.yaml', '.yml', '.md', '.sql', '.sh', '.bat', '.swift', '.kt', '.dart', '.lua', '.pl', '.r', '.scala', '.clj', '.elm', '.ex', '.hs', '.jl', '.nim', '.ml', '.fs', '.ps1', '.vue', '.svelte', '.less', '.styl', '.sass', '.coffee', '.pug', '.haml', '.twig', '.mustache', '.handlebars',
  
  // Specific files
  'README.md', 'package.json', 'Dockerfile', 'Makefile', 'tsconfig.json', 'webpack.config.js', 'vite.config.ts', 'babel.config.js', 'eslint.config.js', 'prettier.config.js', 'rollup.config.js', 'gulpfile.js', 'Gruntfile.js', '.gitignore', '.env', 'LICENSE', 'yarn.lock', 'pom.xml', 'build.gradle', '.travis.yml', '.github', 'Jenkinsfile', 'firebase.json', 'angular.json', 'ionic.config.json', 'platformio.ini',
  
  // Partials and special cases
  'TODO', 'Procfile', 'CMakeLists.txt', 'CONTRIBUTING.md', 'COPYING', 'docker-compose.yml', 'Gemfile',
]

// Color theme for consistent display
const colorTheme = {
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

const getThemedOriginal = themeOriginalIcons(colorTheme)
const getThemedUpdated = themeUpdatedIcons(colorTheme)

function IconDisplay({ filename, original, updated }: { filename: string, original: any, updated: any }) {
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
  const iconComparisons = useMemo(() => {
    return sampleFiles.map(filename => {
      let original, updated
      
      try {
        original = getThemedOriginal(filename)
      } catch (e) {
        original = null
      }
      
      try {
        updated = getThemedUpdated(filename)
      } catch (e) {
        updated = null
      }
      
      return { filename, original, updated }
    })
  }, [])

  const differentCount = iconComparisons.filter(({ original, updated }) => 
    original?.svg !== updated?.svg || original?.color !== updated?.color
  ).length

  const totalCount = iconComparisons.length

  return (
    <div className="app">
      <header>
        <h1>Seti Icons Comparison</h1>
        <p>Comparing original seti-icons package vs updated @peoplesgrocers/seti-icons</p>
        <div className="stats">
          <span className="stat">Total files: {totalCount}</span>
          <span className="stat different">Different: {differentCount}</span>
          <span className="stat same">Same: {totalCount - differentCount}</span>
        </div>
      </header>
      
      <div className="icons-grid">
        {iconComparisons.map(({ filename, original, updated }) => (
          <IconDisplay 
            key={filename}
            filename={filename}
            original={original}
            updated={updated}
          />
        ))}
      </div>
    </div>
  )
}

export default App
