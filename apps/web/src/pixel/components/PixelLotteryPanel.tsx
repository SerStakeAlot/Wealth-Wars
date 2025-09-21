import { motion } from 'framer-motion'
import { PixelLotteryState } from '../lib/types'
import { PixelButton } from './PixelButton'
import { pixelMotionVariants, pixelTransitions } from '../lib/motionVariants'

interface Props { lotteryState: PixelLotteryState; wealth: number; onEnterLottery: (tickets: number) => void }

// Refactored: single-entry model (1 ticket per click) consistent with original UI mechanics
export function PixelLotteryPanel({ lotteryState, wealth, onEnterLottery }: Props) {
  const ticketCost = 25
  const timeLeft = Math.max(0, lotteryState.drawsAt - Date.now())
  const minutes = Math.floor(timeLeft / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  const canEnter = lotteryState.isActive && wealth >= ticketCost
  const handleEnter = () => onEnterLottery(1)
  return (
    <motion.div className="bg-slate-800/90 border-2 border-slate-600 p-4 font-mono" variants={pixelMotionVariants.fadeAndRise} initial="initial" animate="animate" transition={pixelTransitions.medium}>
      <div className="flex items-center gap-2 mb-4"><motion.div className="w-3 h-3 bg-yellow-400 rounded-sm" variants={pixelMotionVariants.lotteryPot} animate={lotteryState.isActive? 'animate':'initial'} transition={pixelTransitions.breathing} /><h3 className="text-yellow-300 text-sm font-bold">LOTTERY</h3></div>
      <div className="space-y-3">
        <motion.div className="text-center border-2 border-yellow-600 bg-yellow-900/20 p-3 rounded" variants={pixelMotionVariants.bumpScale} animate={lotteryState.currentPot>0?'animate':'initial'} transition={pixelTransitions.quick}>
          <div className="text-yellow-300 text-xs mb-1">CURRENT POT</div>
            <div className="text-yellow-400 text-lg font-bold">{lotteryState.currentPot} $WEALTH</div>
        </motion.div>
        <div className="text-center text-xs"><div className="text-slate-300">Next Draw In:</div><div className="text-white font-bold">{minutes.toString().padStart(2,'0')}:{seconds.toString().padStart(2,'0')}</div></div>
        {lotteryState.myTickets > 0 && <div className="text-center text-xs text-emerald-300 border border-emerald-600 p-2 rounded">You have {lotteryState.myTickets} ticket{lotteryState.myTickets>1?'s':''}</div>}
        <PixelButton variant='wealth' onClick={handleEnter} disabled={!canEnter} className='w-full'>ENTER (25 $WEALTH)</PixelButton>
        <div className="text-xs text-slate-400 space-y-1"><div>Single Entry: 25 $WEALTH</div><div>Winner: 80% pot • Treasury 10% • Redistrib 10%</div></div>
      </div>
    </motion.div>
  )
}
