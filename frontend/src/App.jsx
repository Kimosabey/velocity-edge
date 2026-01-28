import { useState, useEffect } from 'react'
import { Container, Title, Text, Group, Stack, Card, Button, Badge, Progress, Grid, Paper } from '@mantine/core'
import { motion } from 'framer-motion'
import { IconBolt, IconChartBar, IconClock, IconRefresh, IconTrash } from '@tabler/icons-react'
import './App.css'

const MotionCard = motion.create(Card)
const MotionButton = motion.create(Button)

function App() {
  const [metrics, setMetrics] = useState({
    cacheHits: 0,
    cacheMisses: 0,
    totalRequests: 0,
    uptime: 0,
    lastMissTime: null,
    lastHitTime: null
  })

  const [testResults, setTestResults] = useState([])
  const [testing, setTesting] = useState(false)
  const [clearing, setClearing] = useState(false)

  const clearCache = async () => {
    setClearing(true)
    try {
      await fetch('http://localhost:8081/api/fast-data', { method: 'PURGE' })
      const result = {
        timestamp: new Date().toLocaleTimeString(),
        endpoint: 'SYSTEM',
        cacheStatus: 'PURGED',
        responseTime: 0,
        data: 'Cache cleared successfully'
      }
      setTestResults(prev => [result, ...prev].slice(0, 10))
    } catch (error) {
      console.error('Failed to purge:', error)
    } finally {
      setTimeout(() => setClearing(false), 500)
    }
  }

  // Uptime counter
  // Sync Uptime with Backend
  // Smart Uptime Sync (Real Backend Time + Smooth Local Ticking)
  useEffect(() => {
    // 1. Function to get authoritative time from server
    const syncWithServer = async () => {
      try {
        const response = await fetch('http://localhost:8081/health')
        const data = await response.json()
        setMetrics(prev => ({ ...prev, uptime: Math.floor(data.uptime) }))
      } catch (e) { /* ignore offline */ }
    }

    // 2. Initial Sync
    syncWithServer()

    // 3. Local Tick (Every second) - Makes it feel "Live"
    const tickInterval = setInterval(() => {
      setMetrics(prev => ({ ...prev, uptime: prev.uptime + 1 }))
    }, 1000)

    // 4. Re-Sync with Server (Every 10 seconds) - Prevents drift
    const syncInterval = setInterval(syncWithServer, 10000)

    return () => {
      clearInterval(tickInterval)
      clearInterval(syncInterval)
    }
  }, [])

  const hitRate = metrics.totalRequests > 0
    ? ((metrics.cacheHits / metrics.totalRequests) * 100).toFixed(1)
    : 0

  const testCacheableEndpoint = async () => {
    setTesting(true)
    const start = performance.now()

    try {
      const response = await fetch('http://localhost:8081/api/fast-data', { cache: 'reload' })
      const end = performance.now()
      const data = await response.json()
      const cacheStatus = response.headers.get('X-Cache') || 'UNKNOWN'
      const responseTime = Math.round(end - start)

      const result = {
        timestamp: new Date().toLocaleTimeString(),
        endpoint: '/api/fast-data',
        cacheStatus,
        responseTime,
        data: JSON.stringify(data).substring(0, 50) + '...',
      }

      setTestResults(prev => [result, ...prev].slice(0, 10))

      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        cacheHits: cacheStatus === 'HIT' ? prev.cacheHits + 1 : prev.cacheHits,
        cacheMisses: cacheStatus === 'MISS' ? prev.cacheMisses + 1 : prev.cacheMisses,
        lastHitTime: cacheStatus === 'HIT' ? responseTime : prev.lastHitTime,
        lastMissTime: cacheStatus === 'MISS' ? responseTime : prev.lastMissTime
      }))
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setTesting(false)
    }
  }

  const testDynamicEndpoint = async () => {
    setTesting(true)
    const start = performance.now()

    try {
      // Add random param to prevent request coalescing
      const response = await fetch(`http://localhost:8081/api/dynamic-data?t=${Date.now()}`)
      const end = performance.now()
      const data = await response.json()
      const cacheStatus = response.headers.get('X-Cache') || 'BYPASSED'
      const responseTime = Math.round(end - start)

      const result = {
        timestamp: new Date().toLocaleTimeString(),
        endpoint: '/api/dynamic-data',
        cacheStatus,
        responseTime,
        data: JSON.stringify(data).substring(0, 50) + '...',
      }

      setTestResults(prev => [result, ...prev].slice(0, 10))
      setMetrics(prev => ({
        ...prev,
        totalRequests: prev.totalRequests + 1,
        lastMissTime: responseTime // Dynamic is effectively a miss/slow comparison
      }))
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setTesting(false)
    }
  }

  const runStressTest = async () => {
    setTesting(true)
    for (let i = 0; i < 10; i++) {
      await testCacheableEndpoint()
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    setTesting(false)
  }

  const formatUptime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="app">
      <Container size="xl">
        <Stack gap="xl" py="xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Group justify="space-between" align="center" className="header-group">
              <div>
                <Group gap="xs">
                  <IconBolt size={40} color="#F4EEE0" stroke={2.5} />
                  <Title order={1} size="h1" style={{ fontSize: '2.5rem', fontWeight: 700, color: '#F4EEE0' }}>
                    VelocityEdge
                  </Title>
                </Group>
                <Text c="rgba(244, 238, 224, 0.7)" size="lg" mt="xs">
                  High-Performance Edge Caching • 99% Latency Reduction
                </Text>
              </div>
              <Badge size="xl" variant="filled" color="gray" style={{ backgroundColor: '#4F4557', color: '#F4EEE0' }}>
                <Group gap="xs">
                  <IconClock size={16} stroke={2.5} />
                  Uptime: {formatUptime(metrics.uptime)}
                </Group>
              </Badge>
            </Group>
          </motion.div>

          {/* Metrics Grid */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <MotionCard
                shadow="xl"
                padding="lg"
                radius="md"
                withBorder
                className="glass-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <Text size="sm" fw={600} style={{ opacity: 0.7 }}>Cache Hits</Text>
                <Title order={2} mt="xs" c="teal">{metrics.cacheHits}</Title>
              </MotionCard>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 3 }}>
              <MotionCard
                shadow="xl"
                padding="lg"
                radius="md"
                withBorder
                className="glass-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <Text size="sm" fw={600} style={{ opacity: 0.7 }}>Cache Misses</Text>
                <Title order={2} mt="xs" c="red">{metrics.cacheMisses}</Title>
              </MotionCard>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 3 }}>
              <MotionCard
                shadow="xl"
                padding="lg"
                radius="md"
                withBorder
                className="glass-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <Text size="sm" fw={600} style={{ opacity: 0.7 }}>Total Requests</Text>
                <Title order={2} mt="xs" c="blue">{metrics.totalRequests}</Title>
              </MotionCard>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 3 }}>
              <MotionCard
                shadow="xl"
                padding="lg"
                radius="md"
                withBorder
                className="glass-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <Text size="sm" fw={600} style={{ opacity: 0.7 }}>Hit Rate</Text>
                <Title order={2} mt="xs" c="violet">{hitRate}%</Title>
                <Progress value={parseFloat(hitRate)} mt="md" color="violet" size="sm" />
              </MotionCard>
            </Grid.Col>
          </Grid>

          {/* Performance Comparison */}
          <MotionCard
            shadow="xl"
            padding="xl"
            radius="md"
            withBorder
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Group justify="apart" mb="md">
              <Title order={3}>
                <Group gap="xs">
                  <IconChartBar size={24} stroke={2} />
                  Performance Comparison
                </Group>
              </Title>
            </Group>

            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="md" radius="md" bg="rgba(255, 59, 48, 0.15)" withBorder style={{ borderColor: 'rgba(255, 59, 48, 0.3)' }}>
                  <Text size="sm" fw={500} style={{ opacity: 0.7 }}>Without Cache (MISS)</Text>
                  <Title order={2} c="red" mt="xs">
                    {metrics.lastMissTime ? `${metrics.lastMissTime}ms` : '---'}
                  </Title>
                  <Progress value={100} mt="md" color="red" size="lg" />
                </Paper>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="md" radius="md" bg="rgba(52, 199, 89, 0.15)" withBorder style={{ borderColor: 'rgba(52, 199, 89, 0.3)' }}>
                  <Text size="sm" fw={500} style={{ opacity: 0.7 }}>With Cache (HIT)</Text>
                  <Title order={2} c="teal" mt="xs">
                    {metrics.lastHitTime ? `${metrics.lastHitTime}ms` : '---'}
                  </Title>
                  <Progress value={2} mt="md" color="teal" size="lg" />
                </Paper>
              </Grid.Col>
            </Grid>
          </MotionCard>

          {/* Test Controls */}
          <MotionCard
            shadow="xl"
            padding="xl"
            radius="md"
            withBorder
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Title order={3} mb="md">Test Cache Performance</Title>
            <Group>
              <MotionButton
                size="lg"
                variant="filled"
                color="gray"
                style={{
                  backgroundColor: '#F4EEE0',
                  color: '#393646',
                  border: '1px solid #F4EEE0'
                }}
                onClick={testCacheableEndpoint}
                loading={testing}
                leftSection={<IconBolt size={20} stroke={2.5} />}
                whileHover={{ scale: 1.05, backgroundColor: '#E5DCC5' }}
                whileTap={{ scale: 0.95 }}
              >
                Test Cacheable Endpoint
              </MotionButton>

              <MotionButton
                size="lg"
                variant="outline"
                color="gray"
                style={{
                  color: '#F4EEE0',
                  borderColor: 'rgba(244, 238, 224, 0.3)',
                  backgroundColor: 'transparent'
                }}
                onClick={testDynamicEndpoint}
                loading={testing}
                leftSection={<IconRefresh size={20} stroke={2.5} />}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(244, 238, 224, 0.1)' }}
                whileTap={{ scale: 0.95 }}
              >
                Test Dynamic Endpoint
              </MotionButton>

              <MotionButton
                size="lg"
                variant="filled"
                color="gray"
                style={{
                  backgroundColor: '#4F4557',
                  color: '#F4EEE0',
                  border: '1px solid rgba(244, 238, 224, 0.1)'
                }}
                onClick={runStressTest}
                loading={testing}
                whileHover={{ scale: 1.05, backgroundColor: '#6D5D6E' }}
                whileTap={{ scale: 0.95 }}
              >
                Run Stress Test (10 Requests)
              </MotionButton>

              <MotionButton
                size="lg"
                variant="outline"
                color="red"
                style={{
                  borderColor: '#ff6b6b',
                  color: '#ff6b6b'
                }}
                onClick={clearCache}
                loading={clearing}
                leftSection={<IconTrash size={20} stroke={2.5} />}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 107, 107, 0.1)' }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Cache
              </MotionButton>
            </Group>
          </MotionCard>

          {/* Request History */}
          {testResults.length > 0 && (
            <MotionCard
              shadow="xl"
              padding="xl"
              radius="md"
              withBorder
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Title order={3} mb="md">Request History</Title>
              <Stack gap="sm">
                {testResults.map((result, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Paper p="md" radius="md" withBorder className="glass-card" style={{ backgroundColor: 'rgba(79, 69, 87, 0.4)' }}>
                      <Group justify="space-between">
                        <div>
                          <Group gap="xs">
                            <Text size="sm" fw={600} c="#F4EEE0">{result.endpoint}</Text>
                            <Badge
                              color={result.cacheStatus === 'HIT' ? 'teal' : result.cacheStatus === 'MISS' ? 'red' : 'gray'}
                              variant="light"
                            >
                              {result.cacheStatus}
                            </Badge>
                          </Group>
                          <Text size="xs" style={{ opacity: 0.8, color: '#E5DCC5' }} mt={4}>{result.timestamp}</Text>
                        </div>
                        <Badge size="lg" color={result.cacheStatus === 'HIT' ? 'teal' : 'red'} variant="filled">
                          {result.responseTime}ms
                        </Badge>
                      </Group>
                    </Paper>
                  </motion.div>
                ))}
              </Stack>
            </MotionCard>
          )}
        </Stack>
      </Container>
    </div>
  )
}

export default App
