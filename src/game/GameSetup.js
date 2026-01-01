// mode
//   local ai
//     difficulty: Easy/Medium/Hard/Impossible
//     color: White/Black/Random
//   local human
//     rotate: Yes/No
//   online multiplayer random
//     name: [a-zA-Z0-9 -_,.]{0,20}
//   online multiplayer invite
//     name: [a-zA-Z0-9 -_,.]{0,20}

const GameSetup = (props) => {
  const { config, setConfig, configOptions } = props

  const ConfigSelector = ({ title, configKey }) => {
    return (
      <div>
        <h2>{title}</h2>
        <div className="">
          {configOptions[configKey].map(([value, label]) => (
            <button className='button-default' key={value} onClick={() => setConfig({ ...config, [configKey]: value })}>{label}</button>
          ))}
        </div>
      </div>
    )
  }
  return (
    <section className="">
      <h1>Game Setup</h1>
      {!config.opponent ? <>
        <ConfigSelector title="Opponent" configKey="opponent" />
      </> : config.opponent === "ai" ? <>
        {!config.color ? <>
          <ConfigSelector title="Color" configKey="color" />
        </> : !config.difficulty ? <>
          <ConfigSelector title="Difficulty" configKey="difficulty" />
        </> : null}

      </> : config.opponent === "local" ? <>
        {!config.rotate ? <>
          <ConfigSelector title="Rotate board" configKey="rotate" />
        </> : null}
      </> : null}
    </section>
  )
}

export default GameSetup