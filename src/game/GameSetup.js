const GameSetup = (props) => {
  const { config, setConfig, configOptions, onCreateGame, onJoinGame } = props

  const ConfigSelector = ({ title, configKey, description }) => {
    const getIcon = (value) => {
      if (configKey === 'opponent') {
        if (value === 'local') return '👥'
        if (value === 'online_friend') return '🌐'
        if (value === 'ai') return '🤖'
      }
      if (configKey === 'color') {
        if (value === 'w') return '⚪'
        if (value === 'b') return '⚫'
        if (value === 'random') return '🎲'
      }
      if (configKey === 'difficulty') {
        if (value === 'easy') return '🟢'
        if (value === 'medium') return '🟡'
        if (value === 'hard') return '🟠'
        if (value === 'impossible') return '🔴'
      }
      if (configKey === 'rotate') {
        return value ? '🔄' : '➡️'
      }
      return ''
    }

    return (
      <div className='w-full max-w-2xl mx-auto'>
        <div className='text-center mb-6'>
          <h2 className='text-3xl font-bold text-gray-800 mb-2'>{title}</h2>
          {description && <p className='text-gray-600 text-sm'>{description}</p>}
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {configOptions[configKey].map(([value, label]) => {
            const isSelected = config[configKey] === value
            return (
              <button
                key={value}
                onClick={() => setConfig({ ...config, [configKey]: value })}
                className={`
                  relative p-6 rounded-xl border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md'
                  }
                `}
              >
                <div className='flex flex-col items-center gap-3'>
                  <span className='text-4xl'>{getIcon(value)}</span>
                  <span className={`font-semibold text-lg ${isSelected ? 'text-blue-700' : 'text-gray-700'}`}>
                    {label}
                  </span>
                </div>
                {isSelected && (
                  <div className='absolute top-2 right-2'>
                    <svg className='w-6 h-6 text-blue-500' fill='currentColor' viewBox='0 0 20 20'>
                      <path fillRule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z' clipRule='evenodd' />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const getStepIndicator = () => {
    if (!config.opponent) return { current: 1, total: 1 }
    if (config.opponent === 'local') return { current: 2, total: 2 }
    if (config.opponent === 'ai') {
      if (!config.color) return { current: 2, total: 3 }
      if (!config.difficulty) return { current: 3, total: 3 }
      return { current: 3, total: 3 }
    }
    if (config.opponent === 'online_friend') {
      if (!config.gameCode) return { current: 2, total: 2 }
      return { current: 2, total: 2 }
    }
    return { current: 1, total: 1 }
  }

  const step = getStepIndicator()

  return (
    <section className='min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-purple-50'>
      <div className='w-full max-w-4xl'>
        <div className='text-center mb-8'>
          <h1 className='text-5xl font-bold text-gray-800 mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            Chess Game Setup
          </h1>
          {step.total > 1 && (
            <div className='flex items-center justify-center gap-2 mt-4'>
              {Array.from({ length: step.total }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i + 1 <= step.current
                      ? 'bg-blue-500 w-8'
                      : 'bg-gray-300 w-2'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {!config.opponent ? (
          <ConfigSelector
            title='Choose Your Opponent'
            configKey='opponent'
            description='Select how you want to play'
          />
        ) : config.opponent === 'ai' ? (
          <>
            {!config.color ? (
              <ConfigSelector
                title='Choose Your Color'
                configKey='color'
                description='Pick which side you want to play'
              />
            ) : !config.difficulty ? (
              <ConfigSelector
                title='Select Difficulty'
                configKey='difficulty'
                description='Choose the AI difficulty level'
              />
            ) : null}
          </>
        ) : config.opponent === 'local' ? (
          <>
            {!config.rotate ? (
              <ConfigSelector
                title='Board Rotation'
                configKey='rotate'
                description='Should the board rotate after each move?'
              />
            ) : null}
          </>
        ) : config.opponent === 'online_friend' && !config.gameCode ? (
          <div className='w-full max-w-2xl mx-auto'>
            <div className='text-center mb-6'>
              <h2 className='text-3xl font-bold text-gray-800 mb-2'>Start or Join Game</h2>
              <p className='text-gray-600 text-sm'>Create a new game or join an existing one</p>
            </div>
            <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
              <button
                onClick={onCreateGame}
                className='group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 min-w-[200px] justify-center'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
                </svg>
                Create Game
              </button>
              <button
                onClick={onJoinGame}
                className='group relative px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 min-w-[200px] justify-center'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' />
                </svg>
                Join Game
              </button>
            </div>
          </div>
        ) : null}

        {config.opponent && config.opponent !== 'online_friend' && (
          <div className='mt-8 text-center'>
            <button
              onClick={() => setConfig({})}
              className='px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-2 mx-auto'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
              </svg>
              Back
            </button>
          </div>
        )}
        {config.opponent === 'online_friend' && !config.gameCode && (
          <div className='mt-6 text-center'>
            <button
              onClick={() => setConfig({})}
              className='px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors flex items-center gap-2 mx-auto'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M10 19l-7-7m0 0l7-7m-7 7h18' />
              </svg>
              Back
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default GameSetup