import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [session, setSession] = useState(null)
  const [activeTab, setActiveTab] = useState('livestock')
  const [animals, setAnimals] = useState([])
  
  // Auth Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  // Animal Form State
  const [tagNumber, setTagNumber] = useState('')
  const [animalType, setAnimalType] = useState('cow') // lowercase for database constraint
  const [gender, setGender] = useState('female')     // lowercase for database constraint
  const [breed, setBreed] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [healthStatus, setHealthStatus] = useState('Healthy')

  // Search & Filter State
  const [searchTag, setSearchTag] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterGender, setFilterGender] = useState('All')

  // Milk Log State
  const [selectedAnimalTag, setSelectedAnimalTag] = useState('')
  const [milkLiter, setMilkLiter] = useState('')
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])
  const [milkLogs, setMilkLogs] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session))
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) {
      fetchAnimals()
      fetchMilkLogs()
    }
  }, [session])

  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setAuthMessage(`Error: ${error.message}`)
      else setAuthMessage('Account created! Check email or login.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setAuthMessage(`Error: ${error.message}`)
    }
    setAuthLoading(false)
  }

  const fetchAnimals = async () => {
    const { data, error } = await supabase.from('animals').select('*')
    if (!error) setAnimals(data)
  }

  const fetchMilkLogs = async () => {
    const { data, error } = await supabase.from('lactation_logs').select('*')
    if (!error) setMilkLogs(data || [])
  }

  const handleAddAnimal = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('animals').insert([
      { 
        tag_number: tagNumber, 
        type: animalType.toLowerCase(),   // lowercase 'cow' / 'buffalo'
        gender: gender.toLowerCase(),     // lowercase 'female' / 'male'
        breed: breed, 
        date_of_birth: dateOfBirth || null, 
        status: healthStatus 
      }
    ])

    if (!error) {
      setTagNumber('')
      setBreed('')
      setDateOfBirth('')
      fetchAnimals()
      alert('Animal added successfully!')
    } else {
      alert(error.message)
    }
  }

  const handleAddMilkLog = async (e) => {
    e.preventDefault()
    if (!selectedAnimalTag) return alert('Please select an animal first.')

    const { error } = await supabase.from('lactation_logs').insert([
      { tag_number: selectedAnimalTag, date: logDate, liters: parseFloat(milkLiter) }
    ])

    if (!error) {
      setMilkLiter('')
      fetchMilkLogs()
      alert('Milk record saved!')
    } else {
      alert(error.message)
    }
  }

  // Calculate Age in Months from date_of_birth
  const calculateAgeInMonths = (dob) => {
    if (!dob) return 'N/A'
    const birth = new Date(dob)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    return months <= 0 ? '0m' : `${months}m`
  }

  const filteredAnimals = animals.filter(animal => {
    const matchesTag = animal.tag_number?.toLowerCase().includes(searchTag.toLowerCase())
    const matchesType = filterType === 'All' || animal.type?.toLowerCase() === filterType.toLowerCase()
    const matchesGender = filterGender === 'All' || animal.gender?.toLowerCase() === filterGender.toLowerCase()
    return matchesTag && matchesType && matchesGender
  })

  const femaleAnimals = animals.filter(a => a.gender?.toLowerCase() === 'female')

  if (!session) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center', fontFamily: 'sans-serif', border: '1px solid #ccc', borderRadius: '10px' }}>
        <h1 style={{ color: '#2e7d32' }}>CowMania</h1>
        <h3>{isSignUp ? 'Create an Account' : 'Login'}</h3>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '10px', fontSize: '16px' }} />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '10px', fontSize: '16px' }} />
          <button type="submit" disabled={authLoading} style={{ padding: '12px', fontSize: '16px', backgroundColor: '#2e7d32', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
            {authLoading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <p style={{ marginTop: '15px', cursor: 'pointer', color: '#0066cc' }} onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
        </p>

        {authMessage && <p style={{ marginTop: '15px', fontWeight: 'bold' }}>{authMessage}</p>}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#2e7d32' }}>CowMania Management</h1>
        <button onClick={() => supabase.auth.signOut()} style={{ padding: '8px 12px', cursor: 'pointer' }}>Logout</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('livestock')} style={{ padding: '10px 20px', background: activeTab === 'livestock' ? '#2e7d32' : '#ccc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
          🐮 Livestock Directory
        </button>
        <button onClick={() => setActiveTab('milk')} style={{ padding: '10px 20px', background: activeTab === 'milk' ? '#2e7d32' : '#ccc', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}>
          🥛 Milk Log
        </button>
      </div>

      {activeTab === 'livestock' && (
        <>
          <form onSubmit={handleAddAnimal} style={{ display: 'grid', gap: '10px', marginBottom: '25px', background: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <h3>Add New Animal</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={animalType} onChange={(e) => setAnimalType(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                <option value="cow">Cow</option>
                <option value="buffalo">Buffalo</option>
              </select>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input placeholder="Tag # (e.g. C-101)" value={tagNumber} onChange={(e) => setTagNumber(e.target.value)} required style={{ flex: 1, padding: '8px' }} />
              <input placeholder="Breed (e.g. Sahiwal)" value={breed} onChange={(e) => setBreed(e.target.value)} required style={{ flex: 1, padding: '8px' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>Date of Birth:</label>
                <input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>Health Status:</label>
                <select value={healthStatus} onChange={(e) => setHealthStatus(e.target.value)} style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}>
                  <option value="Healthy">Healthy</option>
                  <option value="Sick">Sick</option>
                  <option value="Pregnant">Pregnant</option>
                  <option value="Dry">Dry</option>
                </select>
              </div>
            </div>
            <button type="submit" style={{ backgroundColor: '#2e7d32', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}>Save Animal</button>
          </form>

          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#1b5e20' }}>🔍 Quick Search & Selection</h4>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input placeholder="Type Tag Number..." value={searchTag} onChange={(e) => setSearchTag(e.target.value)} style={{ flex: 2, padding: '8px' }} />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                <option value="All">All Types</option>
                <option value="cow">Cows</option>
                <option value="buffalo">Buffalos</option>
              </select>
              <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} style={{ flex: 1, padding: '8px' }}>
                <option value="All">All Genders</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>

          <h3>Animals ({filteredAnimals.length})</h3>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#e0e0e0' }}>
                <th>Tag #</th><th>Type</th><th>Gender</th><th>Breed</th><th>Age</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnimals.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.tag_number}</strong></td>
                  <td style={{ textTransform: 'capitalize' }}>{item.type}</td>
                  <td style={{ textTransform: 'capitalize' }}>{item.gender}</td>
                  <td>{item.breed}</td>
                  <td>{calculateAgeInMonths(item.date_of_birth)}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activeTab === 'milk' && (
        <>
          <form onSubmit={handleAddMilkLog} style={{ display: 'grid', gap: '10px', marginBottom: '25px', background: '#e3f2fd', padding: '15px', borderRadius: '8px' }}>
            <h3>Log Daily Milk Production</h3>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={selectedAnimalTag} onChange={(e) => setSelectedAnimalTag(e.target.value)} required style={{ flex: 1, padding: '8px' }}>
                <option value="">-- Select Female Animal --</option>
                {femaleAnimals.map(a => (
                  <option key={a.id} value={a.tag_number}>{a.tag_number} ({a.type} - {a.breed})</option>
                ))}
              </select>
              <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} required style={{ flex: 1, padding: '8px' }} />
              <input type="number" step="0.1" placeholder="Liters (e.g. 12.5)" value={milkLiter} onChange={(e) => setMilkLiter(e.target.value)} required style={{ flex: 1, padding: '8px' }} />
            </div>
            <button type="submit" style={{ backgroundColor: '#1565c0', color: 'white', padding: '10px', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Save Milk Entry</button>
          </form>

          <h3>Recent Milk Logs</h3>
          <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#e0e0e0' }}>
                <th>Tag #</th><th>Date</th><th>Liters</th>
              </tr>
            </thead>
            <tbody>
              {milkLogs.length === 0 ? (
                <tr><td colSpan="3" style={{ textAlign: 'center' }}>No milk logs recorded yet.</td></tr>
              ) : (
                milkLogs.map((log, index) => (
                  <tr key={index}>
                    <td><strong>{log.tag_number}</strong></td>
                    <td>{log.date}</td>
                    <td>{log.liters} L</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}

export default App