import { motion } from 'framer-motion'
import tasksData from './data/tasks.json'

interface Task {
  id: string
  name: string
  status: string | null
  priority: string | null
  due: string | null
  project: string[]
  lastTouched: string
  source: string | null
}

interface NotionTask {
  id: string
  properties: {
    Name: { title: Array<{ plain_text: string }> }
    Status: { select: { name: string; color: string } | null }
    Priority: { select: { name: string; color: string } | null }
    Due: { date: { start: string } | null }
    Project: { relation: Array<{ id: string }> }
    'Last Touched': { last_edited_time: string }
    Source: { select: { name: string } | null }
  }
}

const projectMap: Record<string, string> = {
  '2fced264-4bae-8115-a01b-fd544ed8c038': 'Woojoosnt',
  '2fced264-4bae-8147-987f-d61e6171ba4c': 'Ark Academy',
  '2fced264-4bae-810a-bb17-e03566a75c9b': 'Oilyburger',
}

function parseTasks(data: { results: NotionTask[] }): Task[] {
  return data.results.map((item) => ({
    id: item.id,
    name: item.properties.Name?.title?.[0]?.plain_text || 'Untitled',
    status: item.properties.Status?.select?.name || null,
    priority: item.properties.Priority?.select?.name || null,
    due: item.properties.Due?.date?.start || null,
    project: item.properties.Project?.relation?.map((r) => projectMap[r.id] || 'Other') || [],
    lastTouched: item.properties['Last Touched']?.last_edited_time || '',
    source: item.properties.Source?.select?.name || null,
  }))
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

function daysOverdue(dueDate: string): number {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = today.getTime() - due.getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

function StatCard({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6"
    >
      <div className={`text-4xl font-bold mb-2 ${color}`}>{value}</div>
      <div className="text-slate-400 text-sm uppercase tracking-wider">{label}</div>
    </motion.div>
  )
}

function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return <span className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-400">No Priority</span>
  
  const colors: Record<string, string> = {
    P0: 'priority-p0',
    P1: 'priority-p1',
    P2: 'priority-p2',
    P3: 'priority-p3',
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${colors[priority] || 'bg-slate-600'}`}>
      {priority}
    </span>
  )
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) return <span className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-400">No Status</span>
  
  const normalized = status.toLowerCase().replace(/\s+/g, '-')
  const className = `status-${normalized} px-3 py-1 rounded-full text-xs font-medium`
  
  return <span className={className}>{status}</span>
}

function TaskRow({ task, index }: { task: Task; index: number }) {
  const overdue = isOverdue(task.due)
  const days = overdue && task.due ? daysOverdue(task.due) : 0
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={`glass-card p-4 mb-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors ${
        overdue ? 'border-red-500/30 overdue-glow' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="font-medium text-white truncate">{task.name}</h3>
          {overdue && (
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs font-semibold animate-pulse">
              {days}d overdue
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-400">{task.project.join(', ') || 'No Project'}</span>
          {task.due && (
            <span className={overdue ? 'text-red-400' : 'text-slate-500'}>
              Due: {new Date(task.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {task.source && <span className="text-slate-600">via {task.source}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-4">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>
    </motion.div>
  )
}

function App() {
  const tasks = parseTasks(tasksData as { results: NotionTask[] })
  
  const stats = {
    total: tasks.length,
    overdue: tasks.filter((t) => isOverdue(t.due)).length,
    p0: tasks.filter((t) => t.priority === 'P0').length,
    p1: tasks.filter((t) => t.priority === 'P1').length,
    p2: tasks.filter((t) => t.priority === 'P2').length,
    done: tasks.filter((t) => t.status === 'Done').length,
  }
  
  const overdueTasks = tasks.filter((t) => isOverdue(t.due)).sort((a, b) => {
    return new Date(a.due || 0).getTime() - new Date(b.due || 0).getTime()
  })
  
  const p0p1Tasks = tasks
    .filter((t) => (t.priority === 'P0' || t.priority === 'P1') && t.status !== 'Done')
    .sort((a, b) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3, null: 4 }
      return (priorityOrder[a.priority as keyof typeof priorityOrder] || 4) - 
             (priorityOrder[b.priority as keyof typeof priorityOrder] || 4)
    })
  
  const todoTasks = tasks
    .filter((t) => t.status !== 'Done' && !isOverdue(t.due) && t.priority !== 'P0' && t.priority !== 'P1')
    .sort((a, b) => new Date(b.lastTouched).getTime() - new Date(a.lastTouched).getTime())

  return (
    <div className="min-h-screen p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Ops HQ Dashboard
          </h1>
          <p className="text-slate-400">Real-time task overview from Notion</p>
          <p className="text-slate-600 text-sm mt-1">Last updated: {new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Asia/Seoul'
          })} KST</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total Tasks" value={stats.total} color="text-white" delay={0} />
          <StatCard label="Overdue" value={stats.overdue} color="text-red-400" delay={0.1} />
          <StatCard label="P0 Critical" value={stats.p0} color="text-red-500" delay={0.2} />
          <StatCard label="P1 High" value={stats.p1} color="text-orange-400" delay={0.3} />
          <StatCard label="P2 Medium" value={stats.p2} color="text-yellow-400" delay={0.4} />
          <StatCard label="Completed" value={stats.done} color="text-green-400" delay={0.5} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <h2 className="text-xl font-semibold text-red-400">Overdue Tasks ({overdueTasks.length})</h2>
              </div>
              <div className="space-y-2">
                {overdueTasks.map((task, i) => (
                  <TaskRow key={task.id} task={task} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* P0/P1 Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-orange-400 mb-4">P0/P1 Priorities ({p0p1Tasks.length})</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {p0p1Tasks.map((task, i) => (
                <TaskRow key={task.id} task={task} index={i} />
              ))}
              {p0p1Tasks.length === 0 && (
                <div className="glass-card p-8 text-center text-slate-500">
                  No active P0/P1 tasks
                </div>
              )}
            </div>
          </motion.div>

          {/* Other Todo Tasks */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-blue-400 mb-4">Other Tasks ({todoTasks.length})</h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {todoTasks.slice(0, 10).map((task, i) => (
                <TaskRow key={task.id} task={task} index={i} />
              ))}
              {todoTasks.length === 0 && (
                <div className="glass-card p-8 text-center text-slate-500">
                  No other pending tasks
                </div>
              )}
            </div>
            {todoTasks.length > 10 && (
              <p className="text-slate-600 text-sm mt-3 text-center">
                +{todoTasks.length - 10} more tasks
              </p>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center text-slate-600 text-sm"
        >
          <p>Connected to Notion Ops HQ • Tasks DB</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default App