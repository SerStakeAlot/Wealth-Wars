import { useGameStore } from '../src/lib/gameStore'

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error('Assertion failed:', message)
    process.exit(2)
  }
}

async function run() {
  const store = useGameStore.getState()

  const targetId = 'fast_food_chain'

  // Ensure player has enough wealth
  if (store.player.wealth < 1000) {
    useGameStore.setState({ player: { ...store.player, wealth: 1000 } })
  }

  // Ensure not owned initially (test buys it)
  useGameStore.setState(state => ({ enhancedBusinesses: state.enhancedBusinesses.map(b => b.id === targetId ? { ...b, owned: false, active: false, lastActivated: 0, abilityCharges: 0 } : b) }))

  // Buy the business
  useGameStore.getState().buyEnhancedBusiness(targetId)
  const afterBuy = useGameStore.getState().enhancedBusinesses.find(b => b.id === targetId)
  assert(afterBuy?.owned === true, 'Business should be owned after buy')

  // Activate it
  useGameStore.getState().activateEnhancedBusiness(targetId)
  const afterActivate = useGameStore.getState().enhancedBusinesses.find(b => b.id === targetId)
  assert(afterActivate?.active === true, 'Business should be active after activation')
  assert((afterActivate?.abilityCharges || 0) > 0, 'Business should have abilityCharges after activation')

  const firstActivatedAt = afterActivate?.lastActivated || 0

  // Attempt to activate again immediately (should be prevented by cooldown)
  useGameStore.getState().activateEnhancedBusiness(targetId)
  const afterSecondAttempt = useGameStore.getState().enhancedBusinesses.find(b => b.id === targetId)
  assert(!!afterSecondAttempt && afterSecondAttempt.lastActivated === firstActivatedAt, 'Second activate within cooldown should not change lastActivated')

  console.log('All activation tests passed')
  process.exit(0)
}

run().catch(e => {
  console.error(e)
  process.exit(1)
})
