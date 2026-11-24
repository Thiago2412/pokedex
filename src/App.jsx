import { useEffect, useState } from 'react'

const tipos = {
  fire: 'Fogo',
  water: 'Água',
  grass: 'Planta',
  electric: 'Elétrico',
  psychic: 'Psíquico',
  ice: 'Gelo',
  dragon: 'Dragão',
  dark: 'Sombrio',
  fairy: 'Fada',
  normal: 'Normal',
  fighting: 'Lutador',
  flying: 'Voador',
  poison: 'Venenoso',
  ground: 'Terra',
  rock: 'Pedra',
  bug: 'Inseto',
  ghost: 'Fantasma',
  steel: 'Aço',
}

const nomesStats = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
}

function App() {
  const [pokemons, setPokemons] = useState([])
  const [busca, setBusca] = useState('')
  const [tipo, setTipo] = useState('')
  const [nomesDoTipo, setNomesDoTipo] = useState(null)
  const [tipoPrincipal, setTipoPrincipal] = useState({})
  const [selecionado, setSelecionado] = useState(null)
  const [soFavoritos, setSoFavoritos] = useState(false)
  const [tema, setTema] = useState(
    () => localStorage.getItem('tema') || 'escuro'
  )
  const [favoritos, setFavoritos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('favoritos')) || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
      .then((res) => res.json())
      .then((data) => setPokemons(data.results))
  }, [])

  useEffect(() => {
    Promise.all(
      Object.keys(tipos).map((chave) =>
        fetch(`https://pokeapi.co/api/v2/type/${chave}`).then((res) =>
          res.json()
        )
      )
    ).then((resultados) => {
      const mapa = {}
      resultados.forEach((r) => {
        r.pokemon.forEach((p) => {
          if (p.slot === 1) mapa[p.pokemon.name] = r.name
        })
      })
      setTipoPrincipal(mapa)
    })
  }, [])

  useEffect(() => {
    if (!tipo) {
      setNomesDoTipo(null)
      return
    }
    fetch(`https://pokeapi.co/api/v2/type/${tipo}`)
      .then((res) => res.json())
      .then((data) => setNomesDoTipo(data.pokemon.map((p) => p.pokemon.name)))
  }, [tipo])

  useEffect(() => {
    localStorage.setItem('favoritos', JSON.stringify(favoritos))
  }, [favoritos])

  useEffect(() => {
    document.documentElement.dataset.tema = tema
    localStorage.setItem('tema', tema)
  }, [tema])

  const getId = (url) => url.split('/').filter(Boolean).pop()

  const alternarFavorito = (id) => {
    setFavoritos((atual) =>
      atual.includes(id) ? atual.filter((f) => f !== id) : [...atual, id]
    )
  }

  const abrirDetalhes = (id) => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then((res) => res.json())
      .then((data) => setSelecionado(data))
  }

  const filtrados = pokemons.filter(
    (p) =>
      p.name.includes(busca.toLowerCase()) &&
      (!nomesDoTipo || nomesDoTipo.includes(p.name)) &&
      (!soFavoritos || favoritos.includes(getId(p.url)))
  )

  return (
    <div className="container">
      <h1 className="titulo">Pokédex</h1>

      <button
        className="tema"
        onClick={() => setTema(tema === 'escuro' ? 'claro' : 'escuro')}
      >
        {tema === 'escuro' ? '☀ Modo claro' : '☾ Modo escuro'}
      </button>

      <input
        className="busca"
        type="text"
        placeholder="Buscar Pokémon..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <div className="tipos">
        <button
          className={soFavoritos ? 'tipo ativo' : 'tipo'}
          onClick={() => setSoFavoritos(!soFavoritos)}
        >
          ♥ Favoritos ({favoritos.length})
        </button>
        <button
          className={tipo === '' ? 'tipo ativo' : 'tipo'}
          onClick={() => setTipo('')}
        >
          Todos
        </button>
        {Object.entries(tipos).map(([chave, nome]) => (
          <button
            key={chave}
            className={tipo === chave ? 'tipo ativo' : 'tipo'}
            onClick={() => setTipo(chave)}
          >
            {nome}
          </button>
        ))}
      </div>

      <div className="grid">
        {filtrados.map((p) => {
          const id = getId(p.url)
          const cor = tipoPrincipal[p.name]
          return (
            <div
              className={cor ? `card cor cor-${cor}` : 'card'}
              key={p.name}
              onClick={() => abrirDetalhes(id)}
            >
              <span className="numero">#{id}</span>
              <button
                className={favoritos.includes(id) ? 'coracao ativo' : 'coracao'}
                aria-label="Favoritar"
                onClick={(e) => {
                  e.stopPropagation()
                  alternarFavorito(id)
                }}
              >
                ♥
              </button>
              <img
                loading="lazy"
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`}
                alt={p.name}
              />
              <h2>{p.name}</h2>
            </div>
          )
        })}
      </div>

      {filtrados.length === 0 && pokemons.length > 0 && (
        <p className="vazio">Nenhum Pokémon encontrado.</p>
      )}

      {selecionado && (
        <div className="fundo" onClick={() => setSelecionado(null)}>
          <div className="carta" onClick={(e) => e.stopPropagation()}>
            <div className="verso">
              <div className="pokebola" />
            </div>
            <div className="modal">
              <button className="fechar" onClick={() => setSelecionado(null)}>
                ✕
              </button>
              <img
                src={selecionado.sprites.other['official-artwork'].front_default}
                alt={selecionado.name}
              />
              <h2>{selecionado.name}</h2>
              <div className="etiquetas">
                {selecionado.types.map((t) => (
                  <span className="etiqueta" key={t.type.name}>
                    {tipos[t.type.name] || t.type.name}
                  </span>
                ))}
              </div>
              <p className="medidas">
                Altura: {selecionado.height / 10} m · Peso:{' '}
                {selecionado.weight / 10} kg
              </p>
              <p className="habilidades">
                Habilidades:{' '}
                {selecionado.abilities
                  .map((a) => a.ability.name.replace('-', ' '))
                  .join(', ')}
              </p>
              {selecionado.stats.map((s) => (
                <div className="stat" key={s.stat.name}>
                  <span>{nomesStats[s.stat.name]}</span>
                  <div className="barra">
                    <div
                      className="preenchido"
                      style={{ width: `${(Math.min(s.base_stat, 150) / 150) * 100}%` }}
                    />
                  </div>
                  <strong>{s.base_stat}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App