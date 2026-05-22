import Sidebar from './Sidebar'
import DiceRollerPanel from '../dice/DiceRollerPanel'
import NpcControlPanel from '../npc/NpcControlPanel'
import NpcForm from '../npc/NpcForm'
import NpcPreview from '../npc/NpcPreview'

export default function AppShell({
  user,
  signOut,
  sidebarTab,
  setSidebarTab,
  manager,
}) {
  return (
    <div className="mx-auto grid h-screen max-w-[1900px] grid-cols-1 gap-6 p-4 xl:grid-cols-[340px_560px_minmax(0,1fr)] xl:p-6">
      <Sidebar
        user={user}
        signOut={signOut}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        manager={manager}
      />

      {sidebarTab === 'dados' ? (
        <DiceRollerPanel
          diceHistory={manager.diceHistory}
          setDiceHistory={manager.setDiceHistory}
        />
      ) : sidebarTab === 'controle' ? (
        <NpcControlPanel
          npcs={manager.visibleControlNpcs}
          trackerDeltas={manager.trackerDeltas}
          setActiveNpcId={manager.setActiveNpcId}
          setSidebarTab={setSidebarTab}
          handleTrackerDeltaChange={manager.handleTrackerDeltaChange}
          applyTrackerChange={manager.applyTrackerChange}
        />
      ) : (
        <>
          <NpcForm manager={manager} />
          <NpcPreview data={manager.data} manager={manager} />
        </>
      )}
    </div>
  )
}