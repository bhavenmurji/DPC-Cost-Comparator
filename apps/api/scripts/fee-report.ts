import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const providers = await prisma.dPCProvider.findMany({
    where: {
      id: { startsWith: 'dpca-' },
      monthlyFee: { gt: 0 }
    },
    select: { state: true, monthlyFee: true }
  })

  const byState: Record<string, { fees: number[]; count: number }> = {}

  for (const p of providers) {
    if (byState[p.state] === undefined) {
      byState[p.state] = { fees: [], count: 0 }
    }
    byState[p.state].fees.push(p.monthlyFee)
    byState[p.state].count++
  }

  const stateStats = Object.entries(byState)
    .map(([state, data]) => {
      const fees = data.fees
      const min = Math.min(...fees)
      const max = Math.max(...fees)
      const avg = fees.reduce((a, b) => a + b, 0) / fees.length
      return { state, count: data.count, min, max, avg: Math.round(avg) }
    })
    .sort((a, b) => b.count - a.count)

  console.log('DPCA Fee Distribution by State')
  console.log('='.repeat(60))
  console.log()
  console.log('State | Count | Min    | Max    | Avg')
  console.log('-'.repeat(50))

  for (const s of stateStats) {
    const state = s.state.padEnd(5)
    const count = s.count.toString().padStart(5)
    const min = ('$' + s.min).padStart(6)
    const max = ('$' + s.max).padStart(6)
    const avg = ('$' + s.avg).padStart(6)
    console.log(`${state} |${count} |${min} |${max} |${avg}`)
  }

  console.log()
  console.log('Total providers with fees:', providers.length)
  console.log('States represented:', stateStats.length)
}

main().catch(console.error).finally(() => prisma.$disconnect())
